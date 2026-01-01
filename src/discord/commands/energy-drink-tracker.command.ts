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
import { EnergyDrinkTrackerService } from '@/energydrinktracker/services/energydrinktracker.service';

@Injectable()
export class EnergyDrinkTrackerCommand {
  private targetUserId: string;
  private targetChannelId: string;
  private targetGuildId: string;

  constructor(
    private readonly client: Client,
    private readonly configService: ConfigService,
    private readonly energyDrinkTrackerService: EnergyDrinkTrackerService,
  ) {
    // TODO: Replace with your Discord user ID, channel ID, and guild ID
    this.targetUserId = '193811926780870657';
    this.targetChannelId = '1456105645894799370';
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
        .setCustomId(`energydrink_yes_${today}`)
        .setLabel('Yes')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`energydrink_no_${today}`)
        .setLabel('No')
        .setStyle(ButtonStyle.Danger),
    );

    await channel.send({
      content: `<@${this.targetUserId}> Did you drink an energy drink today?`,
      components: [row],
    });
  }

  @On('interactionCreate')
  public async onYesButton(@Context() [interaction]: [ButtonInteraction]) {
    if (
      !interaction.isButton() ||
      !interaction.customId.startsWith('energydrink_yes_')
    )
      return;

    if (interaction.user.id !== this.targetUserId) {
      return interaction.reply({
        content: 'Sorry, this button is not for you.',
        ephemeral: true,
      });
    }

    const date = new Date(interaction.customId.replace('energydrink_yes_', ''));
    await this.energyDrinkTrackerService.updateEnergyDrinkTracker(date, true);
    const stats = await this.energyDrinkTrackerService.getEnergyDrinkStats();

    await interaction.update({
      content: `Recorded for ${date.toISOString().split('T')[0]}: You drank an energy drink! ⚡\n\n**Stats:**\nDays with Energy Drink: ${stats.daysWithEnergyDrink}\nDays without Energy Drink: ${stats.daysWithoutEnergyDrink}`,
      components: [],
    });
  }

  @On('interactionCreate')
  public async onNoButton(@Context() [interaction]: [ButtonInteraction]) {
    if (
      !interaction.isButton() ||
      !interaction.customId.startsWith('energydrink_no_')
    )
      return;

    if (interaction.user.id !== this.targetUserId) {
      return interaction.reply({
        content: 'Sorry, this button is not for you.',
        ephemeral: true,
      });
    }

    const date = new Date(interaction.customId.replace('energydrink_no_', ''));
    await this.energyDrinkTrackerService.updateEnergyDrinkTracker(date, false);
    const stats = await this.energyDrinkTrackerService.getEnergyDrinkStats();

    await interaction.update({
      content: `Recorded for ${date.toISOString().split('T')[0]}: No energy drink today! 💪\n\n**Stats:**\nDays with Energy Drink: ${stats.daysWithEnergyDrink}\nDays without Energy Drink: ${stats.daysWithoutEnergyDrink}`,
      components: [],
    });
  }
}
