import ContestManageClient from "./ContestManageClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContestManagementPage({ params }: PageProps) {
  const { id } = await params;

  return <ContestManageClient contestId={id} />;
}
