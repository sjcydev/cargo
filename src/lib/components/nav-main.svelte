<script lang="ts">
	import * as Collapsible from "$lib/components/ui/collapsible/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import ChevronRight from "lucide-svelte/icons/chevron-right";

	let {
		items,
		protectedRoutes,
	}: {
		items: {
			title: string;
			url: string;
			// This should be `Component` after lucide-svelte updates types
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			icon: any;
			isActive?: boolean;
			items?: {
				title: string;
				url: string;
			}[];
		}[];
		protectedRoutes: Set<string>;
	} = $props();
</script>

<Sidebar.Group>
	<!-- <Sidebar.GroupLabel>Sistema</Sidebar.GroupLabel> -->
	<Sidebar.Menu>
		{#each items as mainItem (mainItem.title)}
			{#if !protectedRoutes.has(mainItem.url)}
				<Collapsible.Root open={mainItem.isActive}>
					{#snippet child({ props })}
						<Sidebar.MenuItem {...props}>
							<Sidebar.MenuButton>
								{#snippet tooltipContent()}
									{mainItem.title}
								{/snippet}
								{#snippet child({ props })}
									<a href={mainItem.url} {...props}>
										<mainItem.icon />
										<span>{mainItem.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
							{#if mainItem.items?.length}
								<Collapsible.Trigger>
									{#snippet child({ props })}
										<Sidebar.MenuAction
											{...props}
											class="data-[state=open]:rotate-90"
										>
											<ChevronRight />
											<span class="sr-only">Toggle</span>
										</Sidebar.MenuAction>
									{/snippet}
								</Collapsible.Trigger>
								<Collapsible.Content>
									<Sidebar.MenuSub>
										{#each mainItem.items as subItem (subItem.title)}
											<Sidebar.MenuSubItem>
												<Sidebar.MenuSubButton href={subItem.url}>
													<span>{subItem.title}</span>
												</Sidebar.MenuSubButton>
											</Sidebar.MenuSubItem>
										{/each}
									</Sidebar.MenuSub>
								</Collapsible.Content>
							{/if}
						</Sidebar.MenuItem>
					{/snippet}
				</Collapsible.Root>
			{/if}
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
