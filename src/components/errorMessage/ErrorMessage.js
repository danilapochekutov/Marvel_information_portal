import img from "./151. error.gif";

const ErrorMessage = () => {
	return (
		<img
			style={{
				margin: "0 auto",
				display: "block",
				width: "250px",
				height: "250px",
				objectFit: "contain",
			}}
			src={img}
			alt='Error'
		/>
	);
};

export default ErrorMessage;
