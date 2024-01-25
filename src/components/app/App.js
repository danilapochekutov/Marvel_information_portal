import React, {lazy, Suspense, useState, useEffect} from "react";
import {BrowserRouter as Router, Route, Routes, Outlet} from "react-router-dom";
import {SwitchTransition, CSSTransition} from "react-transition-group";
import {useLocation} from "react-router-dom";

import AppHeader from "../appHeader/AppHeader";
import Spinner from "../spinner/Spinner";
import {MainPage, ComicsPage, SingleComicPage, SinglePage, SingleCharPage} from "../pages";
import "./pageTransition.scss";

const Page404 = lazy(() => import("../pages/404"));

const App = () => {
	return (
		<Router>
			<div className='app'>
				<AppHeader />
				<main>
					<Suspense fallback={<Spinner />}>
						<Routes>
							<Route path='/' element={<View />}>
								<Route path='/' element={<MainPage />} />
								<Route path='comics' element={<ComicsPage />} />
								<Route
									path='comics/:id'
									element={
										<SinglePage Component={SingleComicPage} dataType='comic' />
									}
								/>
								<Route
									path='characters/:id'
									element={
										<SinglePage
											Component={SingleCharPage}
											dataType='character'
										/>
									}
								/>
								<Route path='*' element={<Page404 />} />
							</Route>
						</Routes>
					</Suspense>
				</main>
			</div>
		</Router>
	);
};

const View = () => {
	const location = useLocation();
	const [animationDone, setAnimationDone] = useState(false);

	useEffect(() => {
		setAnimationDone(false);
	}, [location.key]);

	return (
		<SwitchTransition component={null}>
			<CSSTransition
				key={location.key}
				classNames='page'
				timeout={300}
				onEntered={() => setAnimationDone(true)}
				unmountOnExit
				mountOnEnter
			>
				<div className={`page ${animationDone ? "page-enter-done" : ""}`}>
					<Outlet />
				</div>
			</CSSTransition>
		</SwitchTransition>
	);
};

export default App;
