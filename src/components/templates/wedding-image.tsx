import Image from 'next/image';
import type { CSSProperties } from 'react';
export function WeddingImage({src,alt,hero=false,style}:{src:string;alt:string;hero?:boolean;style?:CSSProperties}){
 const allowed=src.startsWith('/')||src.startsWith('https://images.unsplash.com/')||src.startsWith('https://sikswvcuyhtusnxyafzj.supabase.co/storage/v1/object/public/invitation-media/');
 return <Image src={src} alt={alt} fill sizes={hero?'100vw':'(max-width: 700px) 100vw, 50vw'} preload={hero} unoptimized={!allowed} style={{objectFit:'cover',...style}}/>;
}
