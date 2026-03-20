import { erc20, erc721, erc1155 } from '@openzeppelin/wizard';
import type { ScaffoldConfig } from './types';

export function generateSolidity(config: ScaffoldConfig): string {
  switch (config.contractType) {
    case 'ERC20':
      return erc20.print({
        name: config.name,
        symbol: config.symbol,
        mintable: config.features.mintable,
        burnable: config.features.burnable,
        pausable: config.features.pausable,
        permit: config.features.permit,
        votes: config.features.votes,
        access: config.accessControl,
      });
    case 'ERC721':
      return erc721.print({
        name: config.name,
        symbol: config.symbol,
        mintable: config.features.mintable,
        burnable: config.features.burnable,
        pausable: config.features.pausable,
        access: config.accessControl,
      });
    case 'ERC1155':
      return erc1155.print({
        name: config.name,
        uri: 'ipfs://{id}',
        mintable: config.features.mintable,
        burnable: config.features.burnable,
        pausable: config.features.pausable,
        access: config.accessControl,
      });
    default:
      throw new Error(`Contract type ${config.contractType} not yet supported`);
  }
}
