const Button = {
  name: 'button',
  description: 'Button test command.',
  execute: () => ({
    content: 'Button',
    buttons: [
      {
        name: 'Button 1',
        label: 'Button 1',
        primary: true,
        onClick: console.log,
      },
    ],
  }),
};

export default Button;
