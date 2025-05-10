import { Inject, Injectable, Logger } from '@nestjs/common';
import { PaginationBuilder } from './helpers';
import { NecordPaginationOptions } from './interfaces';
import { MODULE_OPTIONS_TOKEN } from './necord-pagination.module-definition';
import { PaginationAction } from './enums';
import { ButtonStyle } from 'discord.js';

@Injectable()
export class NecordPaginationService {
	private static readonly DEFAULT_OPTIONS: NecordPaginationOptions = {
		allowTraversal: false,
		allowSkip: false,
		buttonsPosition: 'end',
		buttons: {
			[PaginationAction.First]: {
				label: 'First',
				emoji: '⏮️',
				style: ButtonStyle.Primary
			},
			[PaginationAction.Back]: {
				label: 'Previous',
				emoji: '⏪',
				style: ButtonStyle.Primary
			},
			[PaginationAction.Next]: {
				label: 'Next',
				emoji: '⏩',
				style: ButtonStyle.Primary
			},
			[PaginationAction.Last]: {
				label: 'Last',
				emoji: '⏭️',
				style: ButtonStyle.Primary
			},
			[PaginationAction.Traverse]: {
				label: 'Traverse',
				emoji: '🔢',
				style: ButtonStyle.Primary
			}
		}
	};

	private readonly cache = new Map<string, PaginationBuilder>();

	public constructor(
		@Inject(MODULE_OPTIONS_TOKEN)
		private readonly options: NecordPaginationOptions
	) {
		this.options = this.deepMerge(NecordPaginationService.DEFAULT_OPTIONS, options ?? {});
	}

	public register(factory: (builder: PaginationBuilder) => PaginationBuilder): PaginationBuilder {
		const builder = factory(new PaginationBuilder(this.options));

		if (this.options.originalUserOnly) {
			builder.enforceOriginalUserOnly();
		}

		this.cache.set(builder.customId, builder);

		return builder;
	}

	public get(customId: string): PaginationBuilder {
		return this.cache.get(customId);
	}

	public delete(customId: string): boolean {
		return this.cache.delete(customId);
	}

	private deepMerge<T>(target: T, source: T): T {
		for (const key in source) {
			if (source[key] instanceof Object) {
				Object.assign(source[key], this.deepMerge(target[key], source[key]));
			}
		}

		Object.assign(target || {}, source);

		return target;
	}
}
