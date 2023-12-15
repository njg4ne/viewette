import React, { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { convert } from "html-to-text";

export default function LexicalEditor({ defaultValue, onSave, loading }) {
  //   const [loading, setLoading] = React.useState(false);
  const editorRef = useRef(null);
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };
  console.log("defaultValue", defaultValue);
  return (
    // <>
    <Editor
      //   disabled={true}
      tinymceScriptSrc={"tinymce/tinymce.min.js"}
      onInit={(evt, editor) => (editorRef.current = editor)}
      initialValue={defaultValue}
      style={{ flexGrow: 1 }}
      onSaveContent={(e) => {
        // setLoading(true);
        onSave(e.content);
        // console.log("onSaveContent", e.content);
        // const clean = convert(e.content);
        // console.log("clean", clean);
      }}
      init={{
        height: "100%",
        width: "100%",
        menubar: false,
        plugins: [
          "lists",
          "save",
          //   "advlist autolink lists link image charmap print preview anchor",
          //   "searchreplace visualblocks code fullscreen",
          //   "insertdatetime media table paste code help wordcount",
        ],
        toolbar: [
          "undo redo | styles removeformat | indent outdent | bold italic underline | h1 blockquote | bullist numlist | save ",
          //   "undo redo | styleselect | bold italic | link image",
          //   "alignleft aligncenter alignright",
        ],
        //   "undo redo | formatselect | " +
        //   "bold italic  | " +
        //   "bullist numlist outdent indent | " +
        //   "removeformat | formatselect",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        save_enablewhendirty: false,
        save_onsavecallback: (e) => {
          //   console.log("save_onsavecallback", e);
        },
      }}
    />
    //       <button onClick={log}>Log editor content</button>
    //     </>
  );
}
