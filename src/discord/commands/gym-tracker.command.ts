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
import { GymTrackerService } from '@/gymtracker/services/gymtracker.service';

@Injectable()
export class GymTrackerCommand {
  private targetUserId: string;
  private targetChannelId: string;
  private targetGuildId: string;

  constructor(
    private readonly client: Client,
    private readonly configService: ConfigService,
    private readonly gymTrackerService: GymTrackerService,
  ) {
    // TODO: Replace with your Discord user ID, channel ID, and guild ID
    this.targetUserId = '101078621753450496';
    this.targetChannelId = '1456105616400580748';
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
        .setCustomId(`gym_yes_${today}`)
        .setLabel('Yes')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`gym_no_${today}`)
        .setLabel('No')
        .setStyle(ButtonStyle.Danger),
    );

    await channel.send({
      content: `<@${this.targetUserId}> Did you go to the gym today?`,
      components: [row],
    });
  }

  @On('interactionCreate')
  public async onYesButton(@Context() [interaction]: [ButtonInteraction]) {
    if (!interaction.isButton() || !interaction.customId.startsWith('gym_yes_'))
      return;

    if (interaction.user.id !== this.targetUserId) {
      return interaction.reply({
        content: 'Sorry, this button is not for you.',
        ephemeral: true,
      });
    }

    const date = new Date(interaction.customId.replace('gym_yes_', ''));
    await this.gymTrackerService.updateGymTracker(date, true);
    const stats = await this.gymTrackerService.getGymStats();

    await interaction.update({
      content: `Recorded for ${date.toISOString().split('T')[0]}: You went to the gym! 💪\n\n**Stats:**\nDays with Gym: ${stats.daysWithGym}\nDays without Gym: ${stats.daysWithoutGym}`,
      components: [],
    });
  }

  @On('interactionCreate')
  public async onNoButton(@Context() [interaction]: [ButtonInteraction]) {
    if (!interaction.isButton() || !interaction.customId.startsWith('gym_no_'))
      return;

    if (interaction.user.id !== this.targetUserId) {
      return interaction.reply({
        content: 'Sorry, this button is not for you.',
        ephemeral: true,
      });
    }

    const date = new Date(interaction.customId.replace('gym_no_', ''));
    await this.gymTrackerService.updateGymTracker(date, false);
    const stats = await this.gymTrackerService.getGymStats();

    await interaction.update({
      content: `Recorded for ${date.toISOString().split('T')[0]}: No gym today! 😴\n\n**Stats:**\nDays with Gym: ${stats.daysWithGym}\nDays without Gym: ${stats.daysWithoutGym}`,
      components: [],
    });
  }
}
