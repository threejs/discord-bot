import config from '../config';

/**
 * Generates an embed with default properties
 */
export const embed = props => ({
  embed: {
    color: config.color,
    author: {
		name: 'Three.js docs',
		icon_url: 'Three.js docs","https://aws1.discourse-cdn.com/standard17/uploads/threejs/original/2X/c/c74c5243388bbfa21a39c3e824ddba702a623dec.png',
		url: 'https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene',
	},
    timestamp: new Date(),
    ...props,
  },
});
