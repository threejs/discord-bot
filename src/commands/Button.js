const Button = {
  name: 'button',
  description: 'Button test command.',
  execute: () => ({
    content: 'Button',
    ephemeral: true,
    buttons: [
      {
        name: 'Button 1',
        label: 'Button 1',
        primary: true,
        onClick: () => 'Button Clicked',
      },
    ],
  }),
};

export default Button;
