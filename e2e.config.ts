import type { E2EConfig, ExecutorNode, StepExecutor } from 'e2e';
import { web } from '@e2e-dev/web';

/** Flatten the public executor tree without relying on snapshot-local node IDs. */
function nodes(node: ExecutorNode): readonly ExecutorNode[] {
  return [node, ...(node.children ?? []).flatMap(nodes)];
}

// Repeat the reported tool choices without a model, credentials, or cache.
const scripted: StepExecutor = {
  name: 'reported-pointer-actions',
  version: '1',
  cache: 'off',
  async runStep(ctx) {
    const observation = await ctx.observe({ tree: true });
    if (!observation.tree) throw new Error('Expected a semantic tree');
    const listed = nodes(observation.tree);
    const label = listed.find(node => node.role === 'textbox' && node.name === 'Edit label');
    if (!label) throw new Error('Expected textbox "Edit label"');
    const container = listed.find(node => node.role === 'group' && node.name === 'Diagram node');
    if (ctx.step.instruction === 'Double-click the node label and rename it') {
      await ctx.actions.doubleTap({ id: (container ?? label).id });
      const after = await ctx.observe({ tree: true });
      const editable = after.tree && nodes(after.tree).find(node => node.role === 'textbox' && node.name === 'Edit label');
      if (!editable) throw new Error('Label disappeared after double-click');
      await ctx.actions.type({ id: editable.id }, 'Renamed');
    } else if (ctx.step.instruction === 'Tap the label at its viewport coordinates') {
      if (!label.rect) throw new Error('Expected label bounds');
      await ctx.actions.tapAt({ x: label.rect.x + label.rect.width / 2, y: label.rect.y + label.rect.height / 2 });
    } else {
      throw new Error('Unknown scripted instruction');
    }
    return { status: 'passed', summary: 'Scripted action completed.' };
  },
};

export default {
  projectId: 'public.e2e.svg-double-click-repro',
  actionTimeout: 1_500,
  timeout: 15_000,
  agents: { default: { executor: scripted } },
  targets: [{
    name: 'chromium',
    engine: web(),
    app: {
      url: 'http://127.0.0.1:4287',
      command: { executable: 'node', args: ['server.mjs'] },
    },
  }],
} satisfies E2EConfig;
