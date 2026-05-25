import { Suspense } from "react";
import { Spin, Result, Button } from "antd";

const LoadingFallback = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      flexDirection: "column",
    }}
  >
    <Spin size="large" tip="Đang tải..." />
  </div>
);

const ErrorFallback = ({ error, resetError }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
    }}
  >
    <Result
      status="404"
      title="Không tải được trang"
      subTitle={error?.message || "Có lỗi xảy ra. Vui lòng thử lại."}
      extra={
        <Button
          type="primary"
          onClick={resetError || (() => window.location.reload())}
        >
          Tải lại
        </Button>
      }
    />
  </div>
);

export default function LazyLoading({ children }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}
