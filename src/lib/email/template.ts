const escape = (v: string) =>
  v.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function invitationEmail({
  name,
  couple,
  date,
  url,
}: {
  name: string;
  couple: string;
  date: string;
  url: string;
}) {
  const subject = `You’re invited · ${couple}`;
  const text = `Dear ${name},\n\nTogether with our families, we would love you to join us as we celebrate our wedding.\n\n${couple}\n${date}\n\nOpen your personal invitation and RSVP: ${url}\n\nYour reception pass is inside. Please keep this personal link private.\n\nWith love,\n${couple}`;
  const html = `<!doctype html><html><body style="margin:0;background:#f4f1e9;color:#36412f;font-family:Georgia,serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:36px 16px"><table role="presentation" width="560" style="width:100%;max-width:560px;background:#fffdf7;border:1px solid #dedbce"><tr><td style="padding:48px 28px;text-align:center"><p style="font:10px Arial;letter-spacing:3px;text-transform:uppercase">Written Dearly</p><p style="font-size:20px;margin-top:42px">Dear ${escape(name)},</p><p style="font-size:15px;line-height:1.9">Together with our families, we would love you to join us as we celebrate our wedding.</p><h1 style="font-size:40px;font-weight:normal;line-height:1.2">${escape(couple)}</h1><p style="font:12px Arial;letter-spacing:2px">${escape(date)}</p><p style="margin:38px 0"><a href="${escape(url)}" style="display:inline-block;background:#37452f;color:#fffdf7;padding:18px 26px;text-decoration:none;font:13px Arial;border-radius:30px">Open your invitation →</a></p><p style="font-size:14px;line-height:1.8">Your personal invitation, RSVP and reception pass are waiting inside.</p><p style="font:11px Arial;line-height:1.8;color:#737567;margin-top:36px">This link is just for your party. Please keep it private.</p><p style="font-size:16px;font-style:italic;margin-top:32px">With love, ${escape(couple)}</p></td></tr></table></td></tr></table></body></html>`;
  return { subject, text, html };
}
