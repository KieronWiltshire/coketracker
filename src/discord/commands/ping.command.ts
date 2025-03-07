import { Injectable } from '@nestjs/common';
import { Context, SlashCommand, SlashCommandContext } from 'necord';

@Injectable()
export class PingCommand {
  @SlashCommand({
    name: 'ping',
    description: 'Replies with pong!',
  })
  public async onPing(@Context() [interaction]: SlashCommandContext) {
    await interaction.reply({
      content: 'Pong! 🏓',
      ephemeral: true,
    });
  }
}
