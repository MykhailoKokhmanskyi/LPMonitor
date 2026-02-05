const RegistrationForm = document.getElementById("registrationForm")
const PasswordInput = document.getElementById("passwordInput")
const PasswordConfirm = document.getElementById("passwordConfirm")
const SubmitButton = document.getElementById("submitButton")

const checkPasswordValidity = (password) => {
	const goodLength = password.length >= 8 && password.length <= 72

	const uppercaseAlphabet = "QWERTYUIOPASDFGHJKLZXCVBNMЙЦУКЕНГШЩЗФІВАПРОЛДЯЧСМИТЬБЮ"
	const numbers = "0123456789"

	let containsUppercase = false;
	let containsLowercase = false;
	let containsNumbers = false;
	for(let i = 0; i < password.length; i++) {
		for(let c = 0; c < uppercaseAlphabet.length; c++) {
			if(password.indexOf(uppercaseAlphabet[c]) != -1 && !containsUppercase) {
				containsUppercase = true;
			}
			if(password.indexOf(uppercaseAlphabet[c].toLowerCase()) != -1 && !containsLowercase) {
				containsLowercase = true;
			}
		}
		for(let d = 0; d < numbers.length; d++) {
			if(password.indexOf(numbers[d]) != -1) {
				containsNumbers = true;
				break
			}
		}
	}
	return goodLength && containsLowercase && containsUppercase && containsNumbers
}

const handleInput = () => {
	const passwordsMatch = PasswordInput.value === PasswordConfirm.value
	SubmitButton.disabled = !RegistrationForm.checkValidity() || !checkPasswordValidity(PasswordInput.value) || !passwordsMatch;
}

PasswordInput.addEventListener('input', handleInput)
PasswordConfirm.addEventListener('input', handleInput)
handleInput()
