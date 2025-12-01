import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import PDFDocument from "pdfkit";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

type PdfInstance = InstanceType<typeof PDFDocument>;

function bufferPDF(build: (doc: PdfInstance) => void) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const bufs: Buffer[] = [];
    doc.on("data", (d) => bufs.push(d as Buffer));
    doc.on("end", () => resolve(Buffer.concat(bufs)));
    doc.on("error", reject);
    build(doc);
    doc.end();
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
    const { acceptance_id, upload = true } = req.body || {};
    if (!acceptance_id) return res.status(400).json({ error: "acceptance_id required" });

    const { data: acc } = await supabase
      .from("client_form_acceptances")
      .select("id, created_at, accepted_name, form_version, client_id, form_id")
      .eq("id", acceptance_id)
      .single();
    if (!acc) return res.status(404).json({ error: "Acceptance not found" });
    const [{ data: form }, { data: client }] = await Promise.all([
      supabase.from("legal_forms").select("title, body_md").eq("id", acc.form_id).single(),
      supabase.from("clients").select("name,email,phone").eq("id", acc.client_id).single(),
    ]);

    const pdf = await bufferPDF((doc) => {
      doc.fontSize(18).text(`${form?.title || "Form"} — v${acc.form_version}`, { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(`Client: ${client?.name || ""}`);
      doc.text(`Email: ${client?.email || ""}`);
      doc.text(`Phone: ${client?.phone || ""}`);
      doc.text(`Signed by: ${acc.accepted_name}`);
      doc.text(`Timestamp: ${new Date(acc.created_at).toLocaleString()}`);
      doc.moveDown();
      doc.fontSize(14).text("Agreement:");
      doc.moveDown(0.5);
      doc.fontSize(11).text(form?.body_md || "", { align: "left" });
    });

    let url: string | undefined;
    if (upload) {
      const path = `${acc.client_id}/signed_form_${acc.id}.pdf`;
      const { error } = await supabase.storage.from("client-files").upload(path, pdf, { contentType: "application/pdf", upsert: true });
      if (error) return res.status(500).json({ error: error.message });
      const { data: signed } = await supabase.storage.from("client-files").createSignedUrl(path, 60 * 60);
      url = signed?.signedUrl;
      await supabase.from("client_form_acceptances").update({ signature_png_url: url }).eq("id", acc.id);
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="signed_${acc.id}.pdf"`);
    return res.status(200).send(pdf);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
