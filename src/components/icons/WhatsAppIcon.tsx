import { FaWhatsapp } from 'react-icons/fa6';

type Props = {
  size?: number;
  className?: string;
};

export default function WhatsAppIcon({ size = 18, className }: Props) {
  return <FaWhatsapp size={size} className={className} aria-label="WhatsApp" />;
}
