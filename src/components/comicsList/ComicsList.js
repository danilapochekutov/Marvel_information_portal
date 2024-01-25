import {useState, useEffect} from "react";
import useMarvelService from "../../components/services/MarvelServices";
import Spinner from "../spinner/Spinner";
import ErrorMessage from "../errorMessage/ErrorMessage";
import {Link} from "react-router-dom";
import {CSSTransition, TransitionGroup} from "react-transition-group";

import "./comicsList.scss";

const ComicsList = () => {
	const [comicsList, setComicsList] = useState([]);
	const [newItemloading, setNewItemloading] = useState(false);
	const [offset, setOffset] = useState(200);
	const [comicsEnded, setComicsEnded] = useState(false);

	const {loading, error, getAllComics} = useMarvelService();

	useEffect(() => {
		const storedComicsList = localStorage.getItem("comicsList");
		const storedOffset = localStorage.getItem("offset");

		if (storedComicsList) {
			// Если есть сохраненный comicsList, восстанавливаем его
			setComicsList(JSON.parse(storedComicsList));
		}

		if (storedOffset) {
			// Если есть сохраненный offset, восстанавливаем его
			setOffset(parseInt(storedOffset, 10));
		} else {
			onRequest(offset, true);
		}

		// Запускаем таймер на 10 минут для обнуления хранилища
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
		getAllComics(offset).then(onCharListLoaded);
	};

	const onCharListLoaded = (newComicsList) => {
		let ended = false;
		if (newComicsList.lenght < 8) {
			ended = true;
		}

		const updatedComicsList = [...comicsList, ...newComicsList];
		setComicsList(updatedComicsList);
		setNewItemloading(false);
		setOffset((offset) => offset + 8);
		localStorage.setItem("comicsList", JSON.stringify(updatedComicsList));
		localStorage.setItem("offset", offset + 8);
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

		return <TransitionGroup className='comics__grid'>{items}</TransitionGroup>;
	}

	const items = renderItems(comicsList);

	const errorMessage = error ? <ErrorMessage /> : null;
	const spinner = loading && !newItemloading ? <Spinner /> : null;

	return (
		<div className='comics__list'>
			{errorMessage}
			{spinner}
			{items}

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
