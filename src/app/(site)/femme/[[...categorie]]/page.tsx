import { GenderPage, genderMetadata } from "@/components/shop/genderPage";

type Props = { params: Promise<{ categorie?: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export const generateMetadata = ({ params }: Props) => genderMetadata("femme", params);
export default function Page({ params, searchParams }: Props) {
  return <GenderPage gender="femme" params={params} searchParams={searchParams} />;
}
