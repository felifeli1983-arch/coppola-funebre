import type { LocaleCode } from '../config';
import it, { type Dictionary } from './it';
import en from './en';
import fr from './fr';
import es from './es';
import de from './de';
import pt from './pt';
import ro from './ro';
import pl from './pl';
import uk from './uk';
import ru from './ru';
import sq from './sq';
import nl from './nl';
import hi from './hi';
import fil from './fil';
import ur from './ur';
import ar from './ar';
import zh from './zh';
import bg from './bg';
import bn from './bn';

const DICTIONARIES: Record<LocaleCode, Dictionary> = {
  it,
  en,
  fr,
  es,
  de,
  pt,
  ro,
  pl,
  uk,
  ru,
  sq,
  nl,
  hi,
  fil,
  ur,
  ar,
  zh,
  bg,
  bn,
};

export function getDictionary(locale: LocaleCode): Dictionary {
  return DICTIONARIES[locale] ?? it;
}
