import { MessageEmbed } from 'discord.js';
import { MESSAGE_LIMITS } from '../constants';
import { getPull, resolveEmoji, validateLinks } from '../utils/github';

const Pull = {
  name: 'pull',
  description: 'Get the PR info from the provided number',
  options: [
    {
      name: 'number',
      description: 'Number of a PR',
      type: 'number',
      required: true,
    },
  ],

  /**
   *
   * @param {{
   *  options: {number: number},
   *  msg:import("discord.js").Message,
   *  interaction: import("discord.js").CommandInteraction
   * }} param0
   */
  async execute({ options, interaction, msg }) {
    if (interaction) interaction.deferReply();

    const pull = await getPull(options[0]).catch(e => e);

    if (!pull)
      return reply(interaction || msg, {
        content: "Please double check the provided number. This PR doesn't exist",
      });
    else return reply(interaction || msg, { embeds: [embed(pull)] });
  },
};

/**
 *
 * @param {import("discord.js").CommandInteraction} target
 * @param {import("discord.js").WebhookEditMessageOptions} options
 * @returns
 */
function reply(target, options) {
  target.reply(options);
  return;
}

/**
 * @param {import("../utils/github").APIResponse} pull
 *@returns {import("discord.js").MessageEmbed}
 */
const embed = pull =>
  new MessageEmbed()
    .setAuthor(pull.user.login, pull.user.avatar_url, pull.user.html_url)
    .setDescription(
      validateLinks(
        `${
          pull.body.length + 30 > MESSAGE_LIMITS.DESC_LENGTH
            ? pull.body.substring(0, MESSAGE_LIMITS.DESC_LENGTH - 33).concat('...')
            : pull.body
        }`
      )
    )
    .setTitle(
      pull.title.length > MESSAGE_LIMITS.TITLE_LENGTH
        ? pull.title.substring(0, MESSAGE_LIMITS.TITLE_LENGTH - 3).concat('...')
        : pull.title
    )
    .addField(
      'Diff',
      `${resolveEmoji(pull)} +${pull.additions} -${pull.deletions} \nFiles changed: ${
        pull.changed_files
      }`
    )
    .setTimestamp()
    .setColor('BLUE')
    .setURL(pull.html_url);

export default Pull;
