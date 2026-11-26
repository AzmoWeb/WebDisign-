import { GenderPage, genderMetadata } from "@/components/shop/genderPage";

type Props = { params: Promise<{ categorie?: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export const generateMetadata = ({ params }: Props) => genderMetadata("homme", params);
export default function Page({ params, searchParams }: Props) {
  return <GenderPage gender="homme" params={params} searchParams={searchParams} />;
}
