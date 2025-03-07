import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Context, On } from 'necord';
import { Cron } from '@nestjs/schedule';
import {
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  TextChannel,
} from 'discord.js';
import { CokeTrackerService } from '@/coketracker/services/coketracker.service';

@Injectable()
export class CokeTrackerCommand {
  private targetUserId: string;
  private targetChannelId: string;
  private targetGuildId: string;

  constructor(
    private readonly client: Client,
    private readonly configService: ConfigService,
    private readonly cokeTrackerService: CokeTrackerService,
  ) {
    // TODO: Replace with your Discord user ID, channel ID, and guild ID
    this.targetUserId = '140424754317361154';
    this.targetChannelId = '1347353137245327453';
    this.targetGuildId = '314079160437964801';
  }

  async onApplicationBootstrap() {
    await this.client.guilds.fetch(this.targetGuildId);
    const channel = await this.client.channels.fetch(this.targetChannelId);
    if (!channel || !(channel instanceof TextChannel)) {
      throw new Error('Invalid channel configuration');
    }
  }

  @Cron('59 23 * * *') // Run at 23:59 every day
  async askDailyQuestion() {
    const channel = (await this.client.channels.fetch(
      this.targetChannelId,
    )) as TextChannel;
    if (!channel) return;

    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`coke_yes_${today}`)
        .setLabel('Yes')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`coke_no_${today}`)
        .setLabel('No')
        .setStyle(ButtonStyle.Danger),
    );

    await channel.send({
      content: `<@${this.targetUserId}> Did you drink Coca-Cola today?`,
      components: [row],
    });
  }

  @On('interactionCreate')
  public async onYesButton(@Context() [interaction]: [ButtonInteraction]) {
    if (
      !interaction.isButton() ||
      !interaction.customId.startsWith('coke_yes_')
    )
      return;

    if (interaction.user.id !== this.targetUserId) {
      return interaction.reply({
        content: 'Sorry, this button is not for you.',
        ephemeral: true,
      });
    }

    const date = new Date(interaction.customId.replace('coke_yes_', ''));
    await this.cokeTrackerService.updateCokeTracker(date, true);
    const stats = await this.cokeTrackerService.getCokeStats();

    await interaction.update({
      content: `Recorded for ${date.toISOString().split('T')[0]}: You had Coca-Cola! 🥤\n\n**Stats:**\nDays with Coke: ${stats.daysWithCoke}\nDays without Coke: ${stats.daysWithoutCoke}`,
      components: [],
    });
  }

  @On('interactionCreate')
  public async onNoButton(@Context() [interaction]: [ButtonInteraction]) {
    if (!interaction.isButton() || !interaction.customId.startsWith('coke_no_'))
      return;

    if (interaction.user.id !== this.targetUserId) {
      return interaction.reply({
        content: 'Sorry, this button is not for you.',
        ephemeral: true,
      });
    }

    const date = new Date(interaction.customId.replace('coke_no_', ''));
    await this.cokeTrackerService.updateCokeTracker(date, false);
    const stats = await this.cokeTrackerService.getCokeStats();

    await interaction.update({
      content: `Recorded for ${date.toISOString().split('T')[0]}: No Coca-Cola! 💪\n\n**Stats:**\nDays with Coke: ${stats.daysWithCoke}\nDays without Coke: ${stats.daysWithoutCoke}`,
      components: [],
    });
  }
}
