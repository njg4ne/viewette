import { useState } from "preact/hooks";
import createFastContext from "../utils/createFastContext";
const lsKey = (l: string) => `app-key-letter-${l}`;
const alphabet = [...Array(26)].map((_, i) => String.fromCharCode(65 + i));
const alphabetObj: Record<string, string> = alphabet.reduce(
  (acc: Record<string, string>, letter) => {
    acc[letter] = localStorage.getItem(lsKey(letter)) || letter;
    return acc;
  },
  {}
);
const { FastContextProvider, useFastContextFields } =
  createFastContext(alphabetObj);
export default function Home() {
  // array of alphabet letters
  const alphabet = [...Array(26)].map((_, i) => String.fromCharCode(65 + i));
  const [store, setStore] = useState(
    alphabet.reduce((acc: Record<string, string>, letter) => {
      acc[letter] = letter;
      return acc;
    }, {})
  );
  const forChange = (l: string) => (e: Event) => {
    const target = e.target as HTMLInputElement;
    setStore((prev) => ({
      ...prev,
      [l]: target.value.toUpperCase(),
    }));
  };
  return (
    <FastContextProvider>
      <table>
        <thead>
          <tr>
            <th>Lowercase</th>
            <th>Uppercase</th>
          </tr>
        </thead>
        <tbody>
          {alphabet.map((letter) => (
            <Row letter={letter} />
            // <tr key={letter}>
            //   <td>
            //     <input
            //       value={store[letter].toLowerCase()}
            //       // onChange={forChange(letter)}
            //       readOnly
            //     />
            //   </td>
            //   <td>
            //     <input value={store[letter]} onChange={forChange(letter)} />
            //   </td>
            // </tr>
          ))}
        </tbody>
      </table>
    </FastContextProvider>
  );
}
enum Case {
  Lowercase,
  Uppercase,
}
function Row({ letter }: { letter: string }) {
  return (
    <tr>
      <Data letter={letter} caseness={Case.Lowercase} />
      <Data letter={letter} caseness={Case.Uppercase} />
    </tr>
  );
}

function Data({ letter, caseness }: { letter: string; caseness: Case }) {
  const { get, set } = useFastContextFields<string>([letter])[letter];
  const inputProps = {
    readOnly: caseness === Case.Lowercase,
    value: caseness === Case.Lowercase ? get.toLowerCase() : get,
    onChange: (e: Event) => {
      const target = e.target as HTMLInputElement;
      const newVal = target.value.toUpperCase();
      setTimeout(() => {
        localStorage.setItem(lsKey(letter), newVal);
      }, 0);
      set(newVal);
    },
  };
  return <TdInput {...inputProps} />;
}

function TdInput(props) {
  return (
    <td style={{ padding: ".5rem", border: "1px dashed white" }}>
      <input {...props} />
    </td>
  );
}
