import { useLoader } from "../context/LoaderContext";

function Loader() {
  const { loader } = useLoader();
  return (
    <>
      {loader && (
        <div className="loader">
          <div className="back1"></div>
          <div className="back2"></div>
          <div className="back3"></div>
        </div>
      )}
    </>
  );
}

export default Loader;
