import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './app/LandingPage'
import Assessment from './app/subpages/Assessment/Assessment'

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<LandingPage />} />
				<Route path="/assessment" element={<Assessment />} />
			</Routes>
		</BrowserRouter>
	)
}