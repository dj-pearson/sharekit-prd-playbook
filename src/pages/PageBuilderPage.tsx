import { useParams } from "react-router-dom";
import { PageBuilder } from "@/components/PageBuilder";

const PageBuilderPage = () => {
  const { pageId } = useParams<{ pageId?: string }>();

  return <PageBuilder pageId={pageId} />;
};

export default PageBuilderPage;
