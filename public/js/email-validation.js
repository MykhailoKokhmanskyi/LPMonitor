const RegistrationForm = document.getElementById("registrationForm")
const EmailInput = document.getElementById("emailInput")
const SubmitButton = document.getElementById("submitButton")

const handleInput = () => {
	SubmitButton.disabled = !RegistrationForm.checkValidity();
}

EmailInput.addEventListener('input', handleInput)
handleInput()
