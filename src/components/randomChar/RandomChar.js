import {useState, useEffect} from "react";
import useMarvelService from "../../components/services/MarvelServices";
import setContent from "../../utils/setContent";

import mjolnir from "../../resources/img/mjolnir.png";

import "./randomChar.scss";

const RandomChar = () => {
	const [char, setChar] = useState({});
	const {getCharacter, clearError, process, setProcess} = useMarvelService();

	useEffect(() => {
		updateChar();
		const timerId = setInterval(updateChar, 40000);

		return () => {
			clearInterval(timerId);
		};
	}, []);

	const onCharLoaded = (char) => {
		setChar(char);
	};

	const updateChar = () => {
		clearError();
		const id = Math.floor(Math.random() * (1011400 - 1011000)) + 1011000;
		getCharacter(id)
			.then(onCharLoaded)
			.then(() => setProcess("confirmed"));
	};

	return (
		<div className='randomchar'>
			{setContent(process, View, char)}
			<div className='randomchar__static'>
				<p className='randomchar__title'>
					Random character for today!
					<br />
					Do you want to get to know him better?
				</p>
				<p className='randomchar__title'>Or choose another one</p>
				<button className='button button__main'>
					<div className='inner' onClick={updateChar}>
						try it
					</div>
				</button>
				<img src={mjolnir} alt='mjolnir' className='randomchar__decoration' />
			</div>
		</div>
	);
};

const View = ({data}) => {
	const {name, description, thumbnail, homepage, wiki} = data;
	let imgStyle = {objectFit: "cover"};
	if (thumbnail === "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg") {
		imgStyle = {objectFit: "contain"};
	}

	const renderDescription = () => {
		if (typeof description === "undefined" || description === null || description === "") {
			return "There is no data about the character.";
		} else {
			return description;
		}
	};

	return (
		<div className='randomchar__block'>
			<img
				src={thumbnail}
				alt='Random character'
				className='randomchar__img'
				style={imgStyle}
			/>
			<div className='randomchar__info'>
				<p className='randomchar__name'>{name}</p>
				<p className='randomchar__descr'>{renderDescription()}</p>
				<div className='randomchar__btns'>
					<a href={homepage} className='button button__main'>
						<div className='inner'>homepage</div>
					</a>
					<a href={wiki} className='button button__secondary'>
						<div className='inner'>Wiki</div>
					</a>
				</div>
			</div>
		</div>
	);
};

export default RandomChar;
