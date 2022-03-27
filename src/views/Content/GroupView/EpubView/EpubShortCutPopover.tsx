import React from 'react';
import classNames from 'classnames';
import { action } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { Popover, Tooltip } from '@mui/material';
import KeyboardIcon from 'boxicons/svg/solid/bxs-keyboard.svg?fill';
import { readerSettingsService } from '~/service/readerSettings';

interface Props {
  className?: string
}

export const EpubShortCutPopover = observer((props: Props) => {
  const state = useLocalObservable(() => ({
    open: false,

    closeTimer: 0,
  }));

  const handleOpen = action(() => {
    window.clearTimeout(state.closeTimer);
    state.open = true;
  });
  const handleClose = action(() => {
    state.open = false;
  });

  const buttonRef = React.useRef<HTMLDivElement>(null);

  return (<>
    <Tooltip title="快捷键">
      <div
        className={classNames(
          'flex flex-center cursor-pointer',
          props.className,
        )}
        onClick={handleOpen}
        ref={buttonRef}
      >
        <KeyboardIcon
          className={classNames(
            !readerSettingsService.state.dark && 'text-black',
            readerSettingsService.state.dark && 'text-gray-af',
          )}
        />
      </div>
    </Tooltip>

    <Popover
      open={state.open}
      onClose={handleClose}
      anchorEl={buttonRef.current}
      anchorOrigin={{
        horizontal: 'center',
        vertical: 'bottom',
      }}
      transformOrigin={{
        horizontal: 'center',
        vertical: 'top',
      }}
    >
      <div className="px-4 pt-1 pb-4">
        <div className="text-center text-20 py-4">
          快捷键
        </div>
        <div className="text-gray-88 divide-y border-t">
          {[
            {
              text: '进入全屏',
              shortcut: ['F'],
            },
            {
              text: '退出全屏',
              shortcut: ['Esc'],
            },
            {
              text: '上一页',
              shortcut: ['←'],
            },
            {
              text: '下一页',
              shortcut: ['Space', 'Enter', '→'],
            },
            {
              text: '上一章',
              shortcut: ['↑'],
            },
            {
              text: '下一章',
              shortcut: ['↓'],
            },
            {
              text: '显示目录',
              shortcut: ['Shift+C'],
            },
            {
              text: '显示标注',
              shortcut: ['Shift+N'],
            },
            {
              text: '返回跳转前位置',
              shortcut: ['Shift+B'],
            },
          ].map((v, i) => (
            <div className="flex justify-between items-center py-2 px-2 gap-x-8" key={i}>
              <div className="text-16">
                {v.text}
              </div>
              <div className="text-14 flex items-center gap-x-2 leading-relaxed">
                {v.shortcut.flatMap((v, i) => [
                  (
                    <ShortCutItem key={i}>
                      {v}
                    </ShortCutItem>
                  ),
                  (
                    <span className="text-13" key={`${i}-or`}>
                      or
                    </span>
                  ),
                ]).slice(0, -1)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Popover>
  </>);
});


const ShortCutItem = (props: { children: React.ReactNode }) => (
  <div className="flex flex-center bg-gray-62 text-white rounded px-[10px] py-1 min-w-[36px]">
    {props.children}
  </div>
);
