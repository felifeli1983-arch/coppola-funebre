type Props = {
  className?: string;
  bg?: string;
  fg?: string;
};

export default function Logo({
  className,
  bg = '#7F1518',
  fg = '#FFFFFF',
}: Props) {
  return (
    <svg
      viewBox="0 0 200 220"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Onoranze Funebri Coppola"
    >
      <rect x="0" y="0" width="200" height="220" fill={bg} />

      <rect
        x="6"
        y="6"
        width="188"
        height="208"
        fill="none"
        stroke={fg}
        strokeWidth="1.5"
      />
      <rect
        x="10"
        y="10"
        width="180"
        height="200"
        fill="none"
        stroke={fg}
        strokeWidth="0.6"
        opacity="0.6"
      />

      <circle cx="100" cy="72" r="36" fill="none" stroke={fg} strokeWidth="2.2" />
      <circle cx="100" cy="72" r="30" fill="none" stroke={fg} strokeWidth="0.6" opacity="0.55" />
      <text
        x="100"
        y="90"
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="52"
        fontWeight="500"
        fill={fg}
        fontStyle="italic"
      >
        C
      </text>

      <text
        x="100"
        y="146"
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="28"
        fontWeight="600"
        fill={fg}
        letterSpacing="6"
      >
        COPPOLA
      </text>

      <line x1="80" y1="159" x2="120" y2="159" stroke={fg} strokeWidth="0.6" opacity="0.8" />

      <text
        x="100"
        y="192"
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontSize="9.5"
        fontWeight="500"
        fill={fg}
        letterSpacing="4.5"
      >
        IMPRESA FUNEBRE
      </text>
    </svg>
  );
}
