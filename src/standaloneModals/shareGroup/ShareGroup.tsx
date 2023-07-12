import React from 'react';
import fs from 'fs/promises';
import { action, runInAction } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { utils } from 'rum-sdk-browser';
import { dialog } from '@electron/remote';
import { OutlinedInput } from '@mui/material';
import { IoMdCopy } from 'react-icons/io';
import { Dialog, Button } from '~/components';
import { sleep, runLoading, lang, setClipboard } from '~/utils';
import { fetchSeed } from '~/apis';
import { bookService, nodeService, tooltipService } from '~/service';

export type Props = ({ groupId: string } | { seed: string });

export const ShareGroup = observer((props: Props & { destroy: () => unknown }) => {
  const state = useLocalObservable(() => ({
    open: true,
    loading: false,
    seed: '',
    get group() {
      try {
        return utils.seedUrlToGroup(this.seed);
      } catch (e) {
        return null;
      }
    },
    get inGroup() {
      return nodeService.state.groups.some((v) => v.group_id === state.group?.groupId);
    },
    get isActiveGroupSeed() {
      return bookService.state.current.groupId && state.group?.groupId === bookService.state.current.groupId;
    },
  }));

  const handleDownloadSeed = async () => {
    try {
      const seedName = `seed.${state.group?.groupName}.json`;
      const file = await dialog.showSaveDialog({
        defaultPath: seedName,
      });
      if (file.canceled || !file.filePath) {
        return;
      }
      await fs.writeFile(file.filePath.toString(), state.seed);
      await sleep(400);
      handleClose();
      tooltipService.show({
        content: lang.shareGroup.downloadedThenShare,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = () => {
    setClipboard(state.seed);
    tooltipService.show({
      content: lang.copied,
    });
  };

  const handleClose = action(() => {
    state.open = false;
    setTimeout(props.destroy, 2000);
  });

  const handleJoinOrOpen = async () => {
    const groupId = state.group?.groupId;
    if (state.inGroup) {
      bookService.openBook({ groupId: groupId! });
      handleClose();
      return;
    }
    if (state.loading) { return; }

    await runLoading(
      (l) => { state.loading = l; },
      async () => {
        try {
          const group = await nodeService.joinGroup(state.seed as any);
          bookService.openBook({ groupId: group.group_id });
        } catch (err: any) {
          console.error(err);
          if (err.message.includes('existed')) {
            tooltipService.show({
              content: lang.joinGroup.existMember,
              type: 'error',
            });
            return;
          }
          tooltipService.show({
            content: lang.somethingWrong,
            type: 'error',
          });
        }
      },
    );
  };

  React.useEffect(action(() => {
    if ('groupId' in props) {
      (async () => {
        try {
          if (props.groupId) {
            const seed = await fetchSeed(props.groupId);
            runInAction(() => {
              state.seed = seed.seed;
              state.open = true;
            });
          }
        } catch (_) {}
      })();
    } else {
      try {
        runInAction(() => {
          state.seed = props.seed;
        });
      } catch (e) {
      }
    }
  }), []);

  return (
    <Dialog
      open={state.open}
      maxWidth={false}
      onClose={handleClose}
    >
      <div className="bg-white rounded-0 text-center py-8 px-10 max-w-[500px]">
        <div className="text-18 font-medium text-gray-4a break-all">
          {state.isActiveGroupSeed ? lang.shareGroup.shareSeed : lang.group.seedNet}
        </div>
        <div className="px-3">
          <OutlinedInput
            className="mt-6 w-100 p-0 break-all"
            onFocus={(e) => e.target.select()}
            classes={{ input: 'p-4 text-12 leading-normal text-gray-9b' }}
            value={state.seed}
            multiline
            minRows={6}
            maxRows={10}
            spellCheck={false}
          />
        </div>

        <div className="text-16 text-gray-9b mt-5 flex justify-center items-center">
          <span
            className="text-link-blue cursor-pointer inline-flex items-center"
            onClick={handleCopy}
          >
            <IoMdCopy className="text-22 mr-1 inline" />
            {lang.shareGroup.copySeed}
          </span>
          <span>
            &nbsp;{lang.shareGroup.copySeedOr}
          </span>
        </div>

        <div className="flex justify-center mt-5 gap-x-4">
          <Button
            className="rounded-full !text-16"
            size="large"
            onClick={handleDownloadSeed}
          >
            {lang.shareGroup.downloadSeed}
          </Button>
          {!state.isActiveGroupSeed && (
            <Button
              className="rounded-full !text-16"
              size="large"
              onClick={handleJoinOrOpen}
              outline
              isDoing={state.loading}
            >
              {state.inGroup ? lang.shareGroup.openSeedGroup : lang.shareGroup.joinSeedGroup}
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
});
