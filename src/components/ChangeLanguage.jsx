import LanguageIcon from '@mui/icons-material/Language';
import { useState } from 'react';

const ChangeLanguage = () => {
	const [isOpen, setIsOpen] = useState(false); // State to track whether the language menu is open or not
	const [selectedLanguage, setSelectedLanguage] = useState('en'); // State to track the selected language

	const handleChangeLanguage = (language) => {
		setSelectedLanguage(language);
		setIsOpen(false);
		console.log('language', language);
		console.log('selectedLanguage', selectedLanguage);
	};

	const languages = [
		{ code: 'en', name: 'English' },
		{ code: 'ru', name: 'Russian' },
		{ code: 'es', name: 'Spanish' },
		{ code: 'fr', name: 'French' }
	]; // Array of languages to display in the menu

	return (
		<div style={{ position: 'relative', display: 'inline-block' }}>
			<LanguageIcon fontSize="large" onClick={() => setIsOpen(!isOpen)} />
			{/* Render the language menu if isOpen is true */}
			{isOpen && (
				<div
					style={{
						position: 'absolute',
						top: '10px',
						left: 0,
						backgroundColor: 'white',
						padding: '1rem',
						borderRadius: '4px',
						boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
						zIndex: 9
					}}
				>
					{/* Language menu options */}
					<ul style={{ textAlign: 'center', textAlign: 'center', padding: '4px', margin: '4px', fontSize: 'initial' }}>
						{languages.map((language) => (
							<li
								key={language.code}
								onClick={() => handleChangeLanguage(language.code)}
								style={{
									cursor: 'pointer',
									fontWeight: selectedLanguage === language.code ? 'bold' : 'normal'
								}}
							>
								{language.name}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};

export default ChangeLanguage;
