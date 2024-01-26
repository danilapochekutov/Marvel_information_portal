import {useState, useEffect} from "react";
import useMarvelService from "../../components/services/MarvelServices";
import Spinner from "../spinner/Spinner";
import ErrorMessage from "../errorMessage/ErrorMessage";
import {Link} from "react-router-dom";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import "./comicsList.scss";

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

const ComicsList = () => {
	const [comicsList, setComicsList] = useState([]);
	const [newItemloading, setNewItemloading] = useState(false);
	const [comicsEnded, setComicsEnded] = useState(false);
	const [offset, setOffset] = useState(200);

	const {getAllComics, process, setProcess} = useMarvelService();

	useEffect(() => {
		const storedComicsList = localStorage.getItem("comicsList");
		const storedOffset = localStorage.getItem("offset");

		if (storedComicsList) {
			setComicsList(JSON.parse(storedComicsList));
			setProcess("loading");
		}

		if (storedOffset) {
			setOffset(parseInt(storedOffset, 10));
			setProcess("confirmed");
		} else {
			onRequest(offset, true);
		}

		setTimeout(
			() => {
				localStorage.removeItem("comicsList");
				localStorage.removeItem("offset");
			},
			10 * 60 * 1000,
		);
	}, []);

	const onRequest = (offset, initial) => {
		initial ? setNewItemloading(false) : setNewItemloading(true);

		getAllComics(offset)
			.then(onComicsListLoaded)
			.then(() => setProcess("confirmed"));
	};

	const onComicsListLoaded = (newComicsList) => {
		let ended = false;
		if (newComicsList.length < 8) {
			ended = true;
		}

		const updatedComicsList = [...comicsList, ...newComicsList];
		localStorage.setItem("comicsList", JSON.stringify(updatedComicsList));
		localStorage.setItem("offset", offset + 8);
		setComicsList(updatedComicsList);
		setNewItemloading(false);
		setOffset((offset) => offset + 8);
		setComicsEnded((comicsEnded) => ended);
	};

	function renderItems(arr) {
		const items = arr.map((item, i) => {
			return (
				<CSSTransition key={item.id} timeout={1000} classNames='comics-item'>
					<li className='comics__item' key={i}>
						<Link to={`/comics/${item.id}`}>
							<img
								src={item.thumbnail}
								alt={item.title}
								className='comics__item-img'
							/>
							<div className='comics__item-name'>{item.title}</div>
							<div className='comics__item-price'>{item.price}</div>
						</Link>
					</li>
				</CSSTransition>
			);
		});

		return (
			<ul className='comics__grid'>
				<TransitionGroup component={null}>{items}</TransitionGroup>
			</ul>
		);
	}

	return (
		<div className='comics__list'>
			{setContent(process, () => renderItems(comicsList), newItemloading)}

			<button
				className='button button__main button__long'
				disabled={newItemloading}
				style={{display: comicsEnded ? "none" : "block"}}
				onClick={() => onRequest(offset)}
			>
				<div className='inner'>load more</div>
			</button>
		</div>
	);
};

export default ComicsList;
