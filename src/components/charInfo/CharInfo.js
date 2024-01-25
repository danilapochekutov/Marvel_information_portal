import {useState, useEffect, useRef} from "react";
import Spinner from "../spinner/Spinner";
import ErrorMessage from "../errorMessage/ErrorMessage";
import useMarvelService from "../../components/services/MarvelServices";
import Skeleton from "../skeleton/Skeleton";
import PropTypes from "prop-types";

import "./charInfo.scss";

const CharInfo = (props) => {
	const [char, setChar] = useState(null);

	const {loading, error, getCharacter, clearError} = useMarvelService();

	useEffect(() => {
		updateChar();
	}, []);

	const prevCharIdRef = useRef(props.charId);

	useEffect(() => {
		if (prevCharIdRef.current !== props.charId) {
			updateChar();
		}

		prevCharIdRef.current = props.charId;
	}, [props.charId]);

	// componentDidUpdate(prevProps, prevState) {
	// 	if (this.props.charId !== prevProps.charId) {
	// 		this.updateChar();
	// 	}
	// }

	const updateChar = () => {
		const {charId} = props;
		if (!charId) {
			return;
		}
		clearError();
		getCharacter(charId).then(onCharListLoaded);
	};

	const onCharListLoaded = (char) => {
		setChar(char);
	};

	const skeleton = char || loading || error ? null : <Skeleton />;

	const errorMessage = error ? <ErrorMessage /> : null;
	const spinner = loading ? <Spinner /> : null;
	const content = !(loading || error || !char) ? <View char={char} /> : null;

	return (
		<div className='char__info'>
			{skeleton}
			{errorMessage}
			{spinner}
			{content}
		</div>
	);
};

const View = ({char}) => {
	const {name, description, thumbnail, homepage, wiki, comics} = char;

	let imgStyle = {objectFit: "cover"};
	if (thumbnail === "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg") {
		imgStyle = {objectFit: "unset"};
	}

	const renderDescription = () => {
		if (typeof description === "undefined" || description === null || description === "") {
			return "There is no data about the character.";
		} else {
			return description;
		}
	};

	return (
		<>
			<div className='char__basics'>
				<img src={thumbnail} alt={name} style={imgStyle} />
				<div>
					<div className='char__info-name'>{name}</div>
					<div className='char__btns'>
						<a href={homepage} className='button button__main'>
							<div className='inner'>homepage</div>
						</a>
						<a href={wiki} className='button button__secondary'>
							<div className='inner'>Wiki</div>
						</a>
					</div>
				</div>
			</div>
			<div className='char__descr'>{renderDescription()}</div>
			<div className='char__comics'>Comics:</div>
			<ul className='char__comics-list'>
				{comics > 0 ? null : "There is no comics with this character!"}
				{comics.map((item, i) => {
					// eslint-disable-next-line
					if (i > 9) return;
					return (
						<li key={i} className='char__comics-item'>
							{item.name}
						</li>
					);
				})}
			</ul>
		</>
	);
};

CharInfo.propTypes = {
	charId: PropTypes.number,
};

export default CharInfo;
