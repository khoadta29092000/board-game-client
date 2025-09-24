/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from "react";

interface UseFileUploaderProps {
  urlTitle: string;
}

export const useFileUploader = ({}: UseFileUploaderProps) => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [img, setImg] = useState<string | null>(null);
  const [enterManually, setEnterManually] = useState(false);
  const [urlManual, setUrlManual] = useState("");
  const [loading, setLoading] = useState(false);
  const [errIMG, setErrIMG] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setErrIMG(null);
    const selectedFiles = e.target.files;

    if (selectedFiles && selectedFiles.length > 0) {
      const file = selectedFiles[0];
      const validFormats = ["image/jpeg", "image/png", "image/webp"];
      const maxSizeInMB = 1;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      const fileName = file.name;

      setFileName(fileName);

      if (!validFormats.includes(file.type)) {
        setErrIMG(
          "The file is invalid. Only JPG or PNG or WEBP formats are accepted."
        );
        return;
      }

      if (file.size > maxSizeInBytes) {
        setErrIMG("The file is too large. Maximum size allowed is 1MB.");
        return;
      }

      setFiles(selectedFiles);
    } else {
      setFiles(null);
      setFileName("");
    }
  };

  function upload(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      if (!files || files.length === 0) {
        setErrIMG("No file provided");
        return;
      }

      setLoading(true);

      try {
        const fileArray = Array.from(files);
        const formData = new FormData();

        fileArray.forEach(file => {
          formData.append("files", file);
        });

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_IMAGE_URL}/api/upload`,
          {
            method: "POST",
            body: formData
          }
        );

        if (response.ok) {
          const res = await response.json();
          const { path } = res[0];
          const url = process.env.NEXT_PUBLIC_IMAGE_URL + path;
          setImg(url);
          resolve(url);
        } else {
          const errText = await response.text();
          console.error("Upload failed:", errText);
          reject("Upload failed");
        }
      } catch (error) {
        console.error("Error during upload:", error);
        reject(error);
      } finally {
        setLoading(false);
      }
    });
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEnterManually(e.target.checked);
    if (!e.target.checked) setUrlManual("");
  };

  return {
    files,
    img,
    enterManually,
    urlManual,
    loading,
    errIMG,
    inputRef,
    handleFileChange,
    upload,
    handleCheckboxChange,
    setUrlManual,
    setErrIMG,
    setImg,
    setEnterManually,
    setFiles,
    fileName,
    setFileName
  };
};
