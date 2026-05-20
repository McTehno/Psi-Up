function AssessmentContextBox() {
	return (
		<div className="context-box">
			<label htmlFor="context">
				Demo, kot potencial, da lahko uporabnik dodatno povpraša
			</label>

			<div className="context-input-row">
				<input
					id="context"
					type="text"
					placeholder=" [Demo] Napišite, da vam pomagamo k boljši odločitvi za doseganje željene kompetence..."
				/>

				<button type="button">➤</button>
			</div>
		</div>
	)
}

export default AssessmentContextBox