import React from 'react';

/**
 * Renders admin-edited legal text (plain text) into the LegalLayout prose style.
 *
 * Conventions (kept deliberately simple for non-technical editors):
 * - blank line = new block
 * - "## Titolo" = heading, "### Sottotitolo" = sub-heading
 * - lines starting with "- " = bulleted list
 * - **testo** = bold, [testo](https://…) / [testo](mailto:…) / [testo](tel:…) = link
 */
export function renderLegaleContent(text: string): React.ReactNode {
  const blocks = text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  const out: React.ReactNode[] = [];
  blocks.forEach((block, i) => renderBlock(block.split('\n'), `b${i}`, out));
  return out;
}

function renderBlock(lines: string[], key: string, out: React.ReactNode[]) {
  let idx = 0;
  // Leading heading line(s)
  while (idx < lines.length && /^#{1,3}\s/.test(lines[idx])) {
    const line = lines[idx];
    const content = inline(line.replace(/^#{1,3}\s+/, ''), `${key}h${idx}`);
    out.push(
      /^###\s/.test(line) ? (
        <h3 key={`${key}h${idx}`}>{content}</h3>
      ) : (
        <h2 key={`${key}h${idx}`}>{content}</h2>
      ),
    );
    idx++;
  }
  // Remaining lines: split into runs of list items vs. paragraph lines
  let run: string[] = [];
  let runIsList = false;
  let n = 0;
  const flush = () => {
    if (!run.length) return;
    const k = `${key}r${n++}`;
    if (runIsList) {
      out.push(
        <ul key={k}>
          {run.map((l, j) => (
            <li key={j}>{inline(l.replace(/^[-*]\s+/, ''), `${k}l${j}`)}</li>
          ))}
        </ul>,
      );
    } else {
      out.push(
        <p key={k}>
          {run.map((l, j) => (
            <React.Fragment key={j}>
              {inline(l, `${k}p${j}`)}
              {j < run.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>,
      );
    }
    run = [];
  };
  for (; idx < lines.length; idx++) {
    const line = lines[idx];
    const isList = /^[-*]\s/.test(line);
    if (/^#{1,3}\s/.test(line)) {
      flush();
      renderBlock(lines.slice(idx), `${key}s${idx}`, out);
      return;
    }
    if (run.length && isList !== runIsList) flush();
    runIsList = isList;
    run.push(line);
  }
  flush();
}

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/)/i;

/** **bold** and [label](href) inline formatting. */
function inline(text: string, key: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1] != null) {
      parts.push(<strong key={`${key}-${n++}`}>{m[1]}</strong>);
    } else {
      const href = m[3];
      if (SAFE_HREF.test(href)) {
        const external = /^https?:\/\//i.test(href);
        parts.push(
          <a
            key={`${key}-${n++}`}
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {m[2]}
          </a>,
        );
      } else {
        parts.push(m[2]);
      }
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
