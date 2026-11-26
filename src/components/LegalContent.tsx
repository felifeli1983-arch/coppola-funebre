import React from 'react';

/**
 * Renders admin-edited legal text (plain text) into the LegalLayout prose style.
 * Conventions: blank line = new block; "# " / "## " = heading; "- " lines = list.
 */
export function renderLegaleContent(text: string): React.ReactNode {
  const blocks = text.replace(/\r\n/g, '\n').split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

  return blocks.map((block, i) => {
    const lines = block.split('\n');

    // Heading
    if (/^#{1,3}\s/.test(lines[0]) && lines.length === 1) {
      return <h2 key={i}>{lines[0].replace(/^#{1,3}\s/, '')}</h2>;
    }

    // Bullet list
    if (lines.every((l) => /^[-*]\s/.test(l))) {
      return (
        <ul key={i}>
          {lines.map((l, j) => (
            <li key={j}>{l.replace(/^[-*]\s/, '')}</li>
          ))}
        </ul>
      );
    }

    // Paragraph (preserve soft line breaks)
    return (
      <p key={i}>
        {lines.map((l, j) => (
          <React.Fragment key={j}>
            {l}
            {j < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    );
  });
}
