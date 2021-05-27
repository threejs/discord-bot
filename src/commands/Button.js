const Button = {
  name: 'button',
  description: 'Button test command.',
  execute: () => ({
    content: 'Button',
    components: [
      {
        name: 'button1',
        label: 'Button 1',
        primary: true,
      },
    ],
  }),
};

export default Button;
