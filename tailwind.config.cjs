/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/@skeletonlabs/skeleton/**/*.{html,js,svelte,ts}'
	],
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#FEFBEC',
					100: '#FDF8DD',
					200: '#FBF0B7',
					300: '#F8E787',
					400: '#F5DD57',
					500: '#F1D11A',
					600: '#DDBE0D',
					700: '#C0A50C',
					800: '#A38C0A',
					900: '#736307'
				},
				success: {
					50: '#E2F9EA',
					100: '#C8F3D7',
					200: '#91E8B0',
					300: '#5BDC88',
					400: '#2BCA62',
					500: '#1F9347',
					600: '#197639',
					700: '#13582B',
					800: '#0C3B1D',
					900: '#061D0E'
				},
				secondary: {
					50: '#DEE5FD',
					100: '#BCCCFA',
					200: '#7A99F5',
					300: '#3362F0',
					400: '#0F3ECC',
					500: '#0A2A8A',
					600: '#08216D',
					700: '#061951',
					800: '#041139',
					900: '#02091D'
				},
				error: {
					50: '#FBEEF1',
					100: '#F8DDE3',
					200: '#F0B8C3',
					300: '#E896A7',
					400: '#E1758A',
					500: '#D9506B',
					600: '#C52B4A',
					700: '#932037',
					800: '#601524',
					900: '#320B13'
				},
				warning: {
					50: '#FBF3EE',
					100: '#F8E7DD',
					200: '#F0CBB7',
					300: '#E9B396',
					400: '#E29A74',
					500: '#DA8050',
					600: '#C6602A',
					700: '#93481F',
					800: '#612F14',
					900: '#33190B'
				}
			}
		}
	},
	plugins: [
    require('@tailwindcss/forms'),
    ...require('@skeletonlabs/skeleton/tailwind/skeleton.cjs')()
  ],
	darkMode: 'class'
};
