export const registerForm = (req, res) => {
	try {
		res.render('registerForm');
	} catch (err) {
		res.status(500).render('500');
	}
}
