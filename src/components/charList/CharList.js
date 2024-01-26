import {useState, useEffect, useRef, useMemo} from "react";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import PropTypes from "prop-types";

import useMarvelService from "../../components/services/MarvelServices";
import Spinner from "../spinner/Spinner";
import ErrorMessage from "../errorMessage/ErrorMessage";

import "./charList.scss";

const setContent = (process, Component, newItemloading) => {
	switch (process) {
		case "waiting":
			return <Spinner />;
		case "loading":
			return newItemloading ? <Component /> : <Spinner />;
		case "confirmed":
			return <Component />;
		case "error":
			return <ErrorMessage />;
		default:
			throw new Error("Unexpected process state");
	}
};

const CharList = (props) => {
	const [charList, setCharList] = useState([]);
	const [newItemloading, setNewItemloading] = useState(false);
	const [offset, setOffset] = useState(210);
	const [charEnded, setCharEnded] = useState(false);

	const {getAllCharacters, process, setProcess} = useMarvelService();

	useEffect(() => {
		const storedCharList = localStorage.getItem("charList");
		const storedOffset = localStorage.getItem("offsetChar");

		if (storedCharList) {
			setCharList(JSON.parse(storedCharList));
			setProcess("loading");
		}

		if (storedOffset) {
			setOffset(parseInt(storedOffset, 10));
			setProcess("confirmed");
		} else {
			onRequest(offset, true);
		}

		// Запускаем таймер на 10 минут для обнуления хранилища
		setTimeout(
			() => {
				localStorage.removeItem("charList");
				localStorage.removeItem("offsetChar");
			},
			10 * 60 * 1000,
		);
	}, []);

	const onRequest = (offset, initial) => {
		initial ? setNewItemloading(false) : setNewItemloading(true);

		getAllCharacters(offset)
			.then(onCharListLoaded)
			.then(() => setProcess("confirmed"));
	};

	const onCharListLoaded = (newCharList) => {
		let ended = false;
		if (newCharList.length < 9) {
			ended = true;
		}
		/* дозагрузка карточек */

		const updatedCharList = [...charList, ...newCharList];
		localStorage.setItem("charList", JSON.stringify(updatedCharList));
		localStorage.setItem("offsetChar", offset + 9);
		setCharList(updatedCharList);
		setNewItemloading(false);
		setOffset((offset) => offset + 9);
		setCharEnded((charEnded) => ended);
	};

	const itemRefs = useRef([]);

	const focusonItem = (id) => {
		itemRefs.current.forEach((item) => item.classList.remove("char__item_selected"));
		itemRefs.current[id].classList.add("char__item_selected");
		itemRefs.current[id].focus();
	};

	const renderItems = (arr) => {
		const items = arr.map((item, i) => {
			let imgStyle = {objectFit: "cover"};
			if (
				item.thumbnail ===
				"http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available.jpg"
			) {
				imgStyle = {objectFit: "unset"};
			}

			return (
				<CSSTransition key={item.id} timeout={1000} classNames='char-item'>
					<li
						className='char__item'
						key={item.id}
						tabIndex={0}
						ref={(el) => (itemRefs.current[i] = el)}
						onClick={() => {
							props.onCharSelected(item.id);
							focusonItem(i);
						}}
						onKeyDown={(e) => {
							if (e.key === " " || e.key === "Enter") {
								props.onCharSelected(item.id);
								focusonItem(i);
							}
						}}
					>
						<img src={item.thumbnail} alt={item.name} style={imgStyle} />
						<div className='char__name'>{item.name}</div>
					</li>
				</CSSTransition>
			);
		});

		return (
			<ul className='char__grid'>
				<TransitionGroup component={null}>{items}</TransitionGroup>
			</ul>
		);
	};

	const elements = useMemo(() => {
		return setContent(process, () => renderItems(charList), newItemloading);
		// eslint-disable-next-line
	}, [process]);

	return (
		<div className='char__list'>
			{elements}
			<button
				className='button button__main button__long'
				disabled={newItemloading}
				style={{display: charEnded ? "none" : "block"}}
				onClick={() => onRequest(offset)}
			>
				<div className='inner'>load more</div>
			</button>
		</div>
	);
};

CharList.propTypes = {
	onCharSelected: PropTypes.func.isRequired,
};

export default CharList;
