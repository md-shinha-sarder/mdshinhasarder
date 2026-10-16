import Custom404Page from "./404";

export default function ErrorPage() {
  return <Custom404Page />;
}

ErrorPage.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
