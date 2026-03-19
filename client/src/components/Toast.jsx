import { useToast } from "../context/ToastContext";
import AlertIcon from "../assets/AlertIcon.svg";

function Toast() {
  const { toast } = useToast();

  return (
    <>
      {toast && (
        <div className="toast">
          <img src={AlertIcon} alt="Alert" />
          <p>{toast}</p>
        </div>
      )}
    </>
  );
}

export default Toast;
