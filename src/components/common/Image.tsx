import Image from "next/image";

type ImageItemProps = {
  src: string;
  alt?: string;
  className?: string;
  height?: number;
  width?: number;
};

export default function ImageItem({
  src,
  alt = "img-flower",
  className = "",
  height = 800,
  width = 398
}: ImageItemProps) {
  return (
    <Image className={`${className}`} src={src} alt={alt} width={height} height={width} priority />
  );
}
