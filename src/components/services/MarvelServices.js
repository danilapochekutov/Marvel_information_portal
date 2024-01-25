import {useHttp} from "../../hooks/http.hook";

const useMarvelService = () => {
	const {loading, request, error, clearError} = useHttp();

	const _apiBase = "https://gateway.marvel.com:443/v1/public/";
	const _apiKey = "apikey=65889265deb457012d2397ae7bfd42e3";
	const _baseOffset = 210;

	const getAllCharacters = async (offset = _baseOffset) => {
		const res = await request(`${_apiBase}characters?limit=9&offset=${offset}&${_apiKey}`);
		return res.data.results.map(_transformCharacter);
	};

	const getCharacter = async (id) => {
		const res = await request(`${_apiBase}characters/${id}?${_apiKey}`);
		return _transformCharacter(res.data.results[0]);
	};

	const getCharacterByName = async (name) => {
		const res = await request(`${_apiBase}characters?name=${name}&${_apiKey}`);
		return res.data.results.map(_transformCharacter);
	};

	const getAllComics = async (offset = _baseOffset) => {
		const res = await request(
			`${_apiBase}comics?orderBy=issueNumber&limit=8&offset=${offset}&${_apiKey}`,
		);
		return res.data.results.map(_transformComics);
	};

	const getComic = async (id) => {
		const res = await request(`${_apiBase}comics/${id}?${_apiKey}`);
		return _transformComics(res.data.results[0]);
	};

	const _transformComics = (comics) => {
		return {
			id: comics.id,
			title: comics.title,
			description: comics.description || "There is no description",
			pageCount: comics.pageCount
				? `${comics.pageCount} p.`
				: "No information about the number of pages",
			thumbnail: comics.thumbnail.path + "." + comics.thumbnail.extension,
			language: comics.textObjects?.language || "en-us",
			price: comics.prices[0].price ? `${comics.prices[0].price}$` : "not available",
		};
	};

	const _transformCharacter = (char) => {
		return {
			id: char.id,
			name: char.name,
			description: char.description || "There is no description",
			thumbnail: char.thumbnail.path + "." + char.thumbnail.extension,
			hompage: char.urls[0].url,
			wiki: char.urls[1].url,
			comics: char.comics.items,
		};
	};

	return {
		loading,
		error,
		getAllCharacters,
		getCharacter,
		getAllComics,
		clearError,
		getComic,
		getCharacterByName,
	};
};

export default useMarvelService;
