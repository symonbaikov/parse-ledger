try {
  (() => {
    const me = Object.create;
    const J = Object.defineProperty;
    const he = Object.getOwnPropertyDescriptor;
    const fe = Object.getOwnPropertyNames;
    const ge = Object.getPrototypeOf;
    const we = Object.prototype.hasOwnProperty;
    const _ = (e =>
      typeof require < 'u'
        ? require
        : typeof Proxy < 'u'
          ? new Proxy(e, { get: (t, a) => (typeof require < 'u' ? require : t)[a] })
          : e)(function (e) {
      if (typeof require < 'u') return require.apply(this, arguments);
      throw Error(`Dynamic require of "${e}" is not supported`);
    });
    const N = (e, t) => () => (e && (t = e((e = 0))), t);
    const be = (e, t) => () => (t || e((t = { exports: {} }).exports, t), t.exports);
    const ye = (e, t, a, s) => {
      if ((t && typeof t === 'object') || typeof t === 'function')
        for (const c of fe(t))
          !we.call(e, c) &&
            c !== a &&
            J(e, c, { get: () => t[c], enumerable: !(s = he(t, c)) || s.enumerable });
      return e;
    };
    const Se = (e, t, a) => (
      (a = e != null ? me(ge(e)) : {}),
      ye(t || !e || !e.__esModule ? J(a, 'default', { value: e, enumerable: !0 }) : a, e)
    );
    const f = N(() => {});
    const g = N(() => {});
    const w = N(() => {});
    const le = be((ce, Z) => {
      f();
      g();
      w();
      (function (e) {
        if (typeof ce === 'object' && typeof Z < 'u') Z.exports = e();
        else if (typeof define === 'function' && define.amd) define([], e);
        else {
          let t;
          typeof window < 'u' || typeof window < 'u'
            ? (t = window)
            : typeof self < 'u'
              ? (t = self)
              : (t = this),
            (t.memoizerific = e());
        }
      })(() => {
        let e;
        let t;
        let a;
        return (function s(c, b, p) {
          function o(n, d) {
            if (!b[n]) {
              if (!c[n]) {
                const r = typeof _ === 'function' && _;
                if (!d && r) return r(n, !0);
                if (i) return i(n, !0);
                const u = new Error(`Cannot find module '${n}'`);
                throw ((u.code = 'MODULE_NOT_FOUND'), u);
              }
              const I = (b[n] = { exports: {} });
              c[n][0].call(
                I.exports,
                h => {
                  const y = c[n][1][h];
                  return o(y || h);
                },
                I,
                I.exports,
                s,
                c,
                b,
                p,
              );
            }
            return b[n].exports;
          }
          for (let i = typeof _ === 'function' && _, m = 0; m < p.length; m++) o(p[m]);
          return o;
        })(
          {
            1: [
              (s, c, b) => {
                c.exports = p => {
                  if (typeof Map !== 'function' || p) {
                    const o = s('./similar');
                    return new o();
                  }
                  return new Map();
                };
              },
              { './similar': 2 },
            ],
            2: [
              (s, c, b) => {
                function p() {
                  return (this.list = []), (this.lastItem = void 0), (this.size = 0), this;
                }
                (p.prototype.get = function (o) {
                  let i;
                  if (this.lastItem && this.isEqual(this.lastItem.key, o)) return this.lastItem.val;
                  if (((i = this.indexOf(o)), i >= 0))
                    return (this.lastItem = this.list[i]), this.list[i].val;
                }),
                  (p.prototype.set = function (o, i) {
                    let m;
                    return this.lastItem && this.isEqual(this.lastItem.key, o)
                      ? ((this.lastItem.val = i), this)
                      : ((m = this.indexOf(o)),
                        m >= 0
                          ? ((this.lastItem = this.list[m]), (this.list[m].val = i), this)
                          : ((this.lastItem = { key: o, val: i }),
                            this.list.push(this.lastItem),
                            this.size++,
                            this));
                  }),
                  (p.prototype.delete = function (o) {
                    let i;
                    if (
                      (this.lastItem &&
                        this.isEqual(this.lastItem.key, o) &&
                        (this.lastItem = void 0),
                      (i = this.indexOf(o)),
                      i >= 0)
                    )
                      return this.size--, this.list.splice(i, 1)[0];
                  }),
                  (p.prototype.has = function (o) {
                    let i;
                    return this.lastItem && this.isEqual(this.lastItem.key, o)
                      ? !0
                      : ((i = this.indexOf(o)), i >= 0 ? ((this.lastItem = this.list[i]), !0) : !1);
                  }),
                  (p.prototype.forEach = function (o, i) {
                    let m;
                    for (m = 0; m < this.size; m++)
                      o.call(i || this, this.list[m].val, this.list[m].key, this);
                  }),
                  (p.prototype.indexOf = function (o) {
                    let i;
                    for (i = 0; i < this.size; i++) if (this.isEqual(this.list[i].key, o)) return i;
                    return -1;
                  }),
                  (p.prototype.isEqual = (o, i) => o === i || (o !== o && i !== i)),
                  (c.exports = p);
              },
              {},
            ],
            3: [
              (s, c, b) => {
                const p = s('map-or-similar');
                c.exports = n => {
                  const d = new p(!1);
                  const r = [];
                  return u => {
                    const I = () => {
                      let h = d;
                      let y;
                      let k;
                      const S = arguments.length - 1;
                      const M = Array(S + 1);
                      let A = !0;
                      let C;
                      if ((I.numArgs || I.numArgs === 0) && I.numArgs !== S + 1)
                        throw new Error(
                          'Memoizerific functions should always be called with the same number of arguments',
                        );
                      for (C = 0; C < S; C++) {
                        if (((M[C] = { cacheItem: h, arg: arguments[C] }), h.has(arguments[C]))) {
                          h = h.get(arguments[C]);
                          continue;
                        }
                        (A = !1), (y = new p(!1)), h.set(arguments[C], y), (h = y);
                      }
                      return (
                        A && (h.has(arguments[S]) ? (k = h.get(arguments[S])) : (A = !1)),
                        A || ((k = u.apply(null, arguments)), h.set(arguments[S], k)),
                        n > 0 &&
                          ((M[S] = { cacheItem: h, arg: arguments[S] }),
                          A ? o(r, M) : r.push(M),
                          r.length > n && i(r.shift())),
                        (I.wasMemoized = A),
                        (I.numArgs = S + 1),
                        k
                      );
                    };
                    return (I.limit = n), (I.wasMemoized = !1), (I.cache = d), (I.lru = r), I;
                  };
                };
                function o(n, d) {
                  const r = n.length;
                  const u = d.length;
                  let I;
                  let h;
                  let y;
                  for (h = 0; h < r; h++) {
                    for (I = !0, y = 0; y < u; y++)
                      if (!m(n[h][y].arg, d[y].arg)) {
                        I = !1;
                        break;
                      }
                    if (I) break;
                  }
                  n.push(n.splice(h, 1)[0]);
                }
                function i(n) {
                  const d = n.length;
                  let r = n[d - 1];
                  let u;
                  let I;
                  for (
                    r.cacheItem.delete(r.arg), I = d - 2;
                    I >= 0 && ((r = n[I]), (u = r.cacheItem.get(r.arg)), !u || !u.size);
                    I--
                  )
                    r.cacheItem.delete(r.arg);
                }
                function m(n, d) {
                  return n === d || (n !== n && d !== d);
                }
              },
              { 'map-or-similar': 1 },
            ],
          },
          {},
          [3],
        )(3);
      });
    });
    f();
    g();
    w();
    f();
    g();
    w();
    f();
    g();
    w();
    f();
    g();
    w();
    const l = __REACT__;
    const {
      Children: $e,
      Component: Je,
      Fragment: V,
      Profiler: Qe,
      PureComponent: Xe,
      StrictMode: et,
      Suspense: tt,
      __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: ot,
      cloneElement: nt,
      createContext: rt,
      createElement: z,
      createFactory: it,
      createRef: at,
      forwardRef: ct,
      isValidElement: lt,
      lazy: st,
      memo: Q,
      startTransition: ut,
      unstable_act: It,
      useCallback: X,
      useContext: pt,
      useDebugValue: dt,
      useDeferredValue: mt,
      useEffect: O,
      useId: ht,
      useImperativeHandle: ft,
      useInsertionEffect: gt,
      useLayoutEffect: wt,
      useMemo: bt,
      useReducer: yt,
      useRef: ee,
      useState: H,
      useSyncExternalStore: St,
      useTransition: vt,
      version: Ct,
    } = __REACT__;
    f();
    g();
    w();
    const kt = __STORYBOOK_API__;
    const {
      ActiveTabs: At,
      Consumer: xt,
      ManagerContext: _t,
      Provider: Ot,
      RequestResponseError: Lt,
      addons: U,
      combineParameters: Bt,
      controlOrMetaKey: Pt,
      controlOrMetaSymbol: Mt,
      eventMatchesShortcut: Vt,
      eventToShortcut: Dt,
      experimental_MockUniversalStore: Nt,
      experimental_UniversalStore: zt,
      experimental_requestResponse: Ht,
      experimental_useUniversalStore: Ut,
      isMacLike: Gt,
      isShortcutTaken: Ft,
      keyToSymbol: qt,
      merge: Wt,
      mockChannel: Yt,
      optionOrAltSymbol: jt,
      shortcutMatchesShortcut: Kt,
      shortcutToHumanString: Zt,
      types: te,
      useAddonState: $t,
      useArgTypes: Jt,
      useArgs: Qt,
      useChannel: Xt,
      useGlobalTypes: eo,
      useGlobals: G,
      useParameter: F,
      useSharedState: to,
      useStoryPrepared: oo,
      useStorybookApi: oe,
      useStorybookState: no,
    } = __STORYBOOK_API__;
    f();
    g();
    w();
    const lo = __STORYBOOK_COMPONENTS__;
    const {
      A: so,
      ActionBar: uo,
      AddonPanel: Io,
      Badge: po,
      Bar: mo,
      Blockquote: ho,
      Button: fo,
      ClipboardCode: go,
      Code: wo,
      DL: bo,
      Div: yo,
      DocumentWrapper: So,
      EmptyTabContent: vo,
      ErrorFormatter: Co,
      FlexBar: Eo,
      Form: To,
      H1: Ro,
      H2: ko,
      H3: Ao,
      H4: xo,
      H5: _o,
      H6: Oo,
      HR: Lo,
      IconButton: L,
      IconButtonSkeleton: Bo,
      Icons: Po,
      Img: Mo,
      LI: Vo,
      Link: Do,
      ListItem: No,
      Loader: zo,
      Modal: Ho,
      OL: Uo,
      P: Go,
      Placeholder: Fo,
      Pre: qo,
      ProgressSpinner: Wo,
      ResetWrapper: Yo,
      ScrollArea: jo,
      Separator: Ko,
      Spaced: Zo,
      Span: $o,
      StorybookIcon: Jo,
      StorybookLogo: Qo,
      Symbols: Xo,
      SyntaxHighlighter: en,
      TT: tn,
      TabBar: on,
      TabButton: nn,
      TabWrapper: rn,
      Table: an,
      Tabs: cn,
      TabsState: ln,
      TooltipLinkList: q,
      TooltipMessage: sn,
      TooltipNote: un,
      UL: In,
      WithTooltip: W,
      WithTooltipPure: pn,
      Zoom: dn,
      codeCommon: mn,
      components: hn,
      createCopyToClipboardFunction: fn,
      getStoryHref: gn,
      icons: wn,
      interleaveSeparators: bn,
      nameSpaceClassNames: yn,
      resetComponents: Sn,
      withReset: vn,
    } = __STORYBOOK_COMPONENTS__;
    f();
    g();
    w();
    const kn = __STORYBOOK_THEMING__;
    const {
      CacheProvider: An,
      ClassNames: xn,
      Global: Y,
      ThemeProvider: _n,
      background: On,
      color: Ln,
      convert: Bn,
      create: Pn,
      createCache: Mn,
      createGlobal: Vn,
      createReset: Dn,
      css: Nn,
      darken: zn,
      ensure: Hn,
      ignoreSsrWarning: Un,
      isPropValid: Gn,
      jsx: Fn,
      keyframes: qn,
      lighten: Wn,
      styled: v,
      themes: Yn,
      typography: jn,
      useTheme: Kn,
      withTheme: Zn,
    } = __STORYBOOK_THEMING__;
    f();
    g();
    w();
    const er = __STORYBOOK_ICONS__;
    const {
      AccessibilityAltIcon: tr,
      AccessibilityIcon: or,
      AccessibilityIgnoredIcon: nr,
      AddIcon: rr,
      AdminIcon: ir,
      AlertAltIcon: ar,
      AlertIcon: cr,
      AlignLeftIcon: lr,
      AlignRightIcon: sr,
      AppleIcon: ur,
      ArrowBottomLeftIcon: Ir,
      ArrowBottomRightIcon: pr,
      ArrowDownIcon: dr,
      ArrowLeftIcon: mr,
      ArrowRightIcon: hr,
      ArrowSolidDownIcon: fr,
      ArrowSolidLeftIcon: gr,
      ArrowSolidRightIcon: wr,
      ArrowSolidUpIcon: br,
      ArrowTopLeftIcon: yr,
      ArrowTopRightIcon: Sr,
      ArrowUpIcon: vr,
      AzureDevOpsIcon: Cr,
      BackIcon: Er,
      BasketIcon: Tr,
      BatchAcceptIcon: Rr,
      BatchDenyIcon: kr,
      BeakerIcon: Ar,
      BellIcon: xr,
      BitbucketIcon: _r,
      BoldIcon: Or,
      BookIcon: Lr,
      BookmarkHollowIcon: Br,
      BookmarkIcon: Pr,
      BottomBarIcon: Mr,
      BottomBarToggleIcon: Vr,
      BoxIcon: Dr,
      BranchIcon: Nr,
      BrowserIcon: ne,
      ButtonIcon: zr,
      CPUIcon: Hr,
      CalendarIcon: Ur,
      CameraIcon: Gr,
      CameraStabilizeIcon: Fr,
      CategoryIcon: qr,
      CertificateIcon: Wr,
      ChangedIcon: Yr,
      ChatIcon: jr,
      CheckIcon: Kr,
      ChevronDownIcon: Zr,
      ChevronLeftIcon: $r,
      ChevronRightIcon: Jr,
      ChevronSmallDownIcon: Qr,
      ChevronSmallLeftIcon: Xr,
      ChevronSmallRightIcon: ei,
      ChevronSmallUpIcon: ti,
      ChevronUpIcon: oi,
      ChromaticIcon: ni,
      ChromeIcon: ri,
      CircleHollowIcon: ii,
      CircleIcon: ai,
      ClearIcon: ci,
      CloseAltIcon: li,
      CloseIcon: si,
      CloudHollowIcon: ui,
      CloudIcon: Ii,
      CogIcon: pi,
      CollapseIcon: di,
      CommandIcon: mi,
      CommentAddIcon: hi,
      CommentIcon: fi,
      CommentsIcon: gi,
      CommitIcon: wi,
      CompassIcon: bi,
      ComponentDrivenIcon: yi,
      ComponentIcon: Si,
      ContrastIcon: vi,
      ContrastIgnoredIcon: Ci,
      ControlsIcon: Ei,
      CopyIcon: Ti,
      CreditIcon: Ri,
      CrossIcon: ki,
      DashboardIcon: Ai,
      DatabaseIcon: xi,
      DeleteIcon: _i,
      DiamondIcon: Oi,
      DirectionIcon: Li,
      DiscordIcon: Bi,
      DocChartIcon: Pi,
      DocListIcon: Mi,
      DocumentIcon: Vi,
      DownloadIcon: Di,
      DragIcon: Ni,
      EditIcon: zi,
      EllipsisIcon: Hi,
      EmailIcon: Ui,
      ExpandAltIcon: Gi,
      ExpandIcon: Fi,
      EyeCloseIcon: qi,
      EyeIcon: Wi,
      FaceHappyIcon: Yi,
      FaceNeutralIcon: ji,
      FaceSadIcon: Ki,
      FacebookIcon: Zi,
      FailedIcon: $i,
      FastForwardIcon: Ji,
      FigmaIcon: Qi,
      FilterIcon: Xi,
      FlagIcon: ea,
      FolderIcon: ta,
      FormIcon: oa,
      GDriveIcon: na,
      GithubIcon: ra,
      GitlabIcon: ia,
      GlobeIcon: aa,
      GoogleIcon: ca,
      GraphBarIcon: la,
      GraphLineIcon: sa,
      GraphqlIcon: ua,
      GridAltIcon: Ia,
      GridIcon: pa,
      GrowIcon: j,
      HeartHollowIcon: da,
      HeartIcon: ma,
      HomeIcon: ha,
      HourglassIcon: fa,
      InfoIcon: ga,
      ItalicIcon: wa,
      JumpToIcon: ba,
      KeyIcon: ya,
      LightningIcon: Sa,
      LightningOffIcon: va,
      LinkBrokenIcon: Ca,
      LinkIcon: Ea,
      LinkedinIcon: Ta,
      LinuxIcon: Ra,
      ListOrderedIcon: ka,
      ListUnorderedIcon: Aa,
      LocationIcon: xa,
      LockIcon: _a,
      MarkdownIcon: Oa,
      MarkupIcon: La,
      MediumIcon: Ba,
      MemoryIcon: Pa,
      MenuIcon: Ma,
      MergeIcon: Va,
      MirrorIcon: Da,
      MobileIcon: re,
      MoonIcon: Na,
      NutIcon: za,
      OutboxIcon: Ha,
      OutlineIcon: Ua,
      PaintBrushIcon: Ga,
      PaperClipIcon: Fa,
      ParagraphIcon: qa,
      PassedIcon: Wa,
      PhoneIcon: Ya,
      PhotoDragIcon: ja,
      PhotoIcon: Ka,
      PhotoStabilizeIcon: Za,
      PinAltIcon: $a,
      PinIcon: Ja,
      PlayAllHollowIcon: Qa,
      PlayBackIcon: Xa,
      PlayHollowIcon: ec,
      PlayIcon: tc,
      PlayNextIcon: oc,
      PlusIcon: nc,
      PointerDefaultIcon: rc,
      PointerHandIcon: ic,
      PowerIcon: ac,
      PrintIcon: cc,
      ProceedIcon: lc,
      ProfileIcon: sc,
      PullRequestIcon: uc,
      QuestionIcon: Ic,
      RSSIcon: pc,
      RedirectIcon: dc,
      ReduxIcon: mc,
      RefreshIcon: ie,
      ReplyIcon: hc,
      RepoIcon: fc,
      RequestChangeIcon: gc,
      RewindIcon: wc,
      RulerIcon: bc,
      SaveIcon: yc,
      SearchIcon: Sc,
      ShareAltIcon: vc,
      ShareIcon: Cc,
      ShieldIcon: Ec,
      SideBySideIcon: Tc,
      SidebarAltIcon: Rc,
      SidebarAltToggleIcon: kc,
      SidebarIcon: Ac,
      SidebarToggleIcon: xc,
      SpeakerIcon: _c,
      StackedIcon: Oc,
      StarHollowIcon: Lc,
      StarIcon: Bc,
      StatusFailIcon: Pc,
      StatusIcon: Mc,
      StatusPassIcon: Vc,
      StatusWarnIcon: Dc,
      StickerIcon: Nc,
      StopAltHollowIcon: zc,
      StopAltIcon: Hc,
      StopIcon: Uc,
      StorybookIcon: Gc,
      StructureIcon: Fc,
      SubtractIcon: qc,
      SunIcon: Wc,
      SupportIcon: Yc,
      SweepIcon: jc,
      SwitchAltIcon: Kc,
      SyncIcon: Zc,
      TabletIcon: ae,
      ThumbsUpIcon: $c,
      TimeIcon: Jc,
      TimerIcon: Qc,
      TransferIcon: K,
      TrashIcon: Xc,
      TwitterIcon: el,
      TypeIcon: tl,
      UbuntuIcon: ol,
      UndoIcon: nl,
      UnfoldIcon: rl,
      UnlockIcon: il,
      UnpinIcon: al,
      UploadIcon: cl,
      UserAddIcon: ll,
      UserAltIcon: sl,
      UserIcon: ul,
      UsersIcon: Il,
      VSCodeIcon: pl,
      VerifiedIcon: dl,
      VideoIcon: ml,
      WandIcon: hl,
      WatchIcon: fl,
      WindowsIcon: gl,
      WrenchIcon: wl,
      XIcon: bl,
      YoutubeIcon: yl,
      ZoomIcon: Sl,
      ZoomOutIcon: vl,
      ZoomResetIcon: Cl,
      iconList: El,
    } = __STORYBOOK_ICONS__;
    const $ = Se(le());
    const B = 'storybook/viewport';
    const x = 'viewport';
    const Ie = {
      mobile1: {
        name: 'Small mobile',
        styles: { height: '568px', width: '320px' },
        type: 'mobile',
      },
      mobile2: {
        name: 'Large mobile',
        styles: { height: '896px', width: '414px' },
        type: 'mobile',
      },
      tablet: { name: 'Tablet', styles: { height: '1112px', width: '834px' }, type: 'tablet' },
    };
    const P = {
      name: 'Reset viewport',
      styles: { height: '100%', width: '100%' },
      type: 'desktop',
    };
    const Ce = { [x]: { value: void 0, isRotated: !1 } };
    const Ee = { viewport: 'reset', viewportRotated: !1 };
    const Te = globalThis.FEATURES?.viewportStoryGlobals ? Ce : Ee;
    const pe = (e, t) => e.indexOf(t);
    const Re = (e, t) => {
      const a = pe(e, t);
      return a === e.length - 1 ? e[0] : e[a + 1];
    };
    const ke = (e, t) => {
      const a = pe(e, t);
      return a < 1 ? e[e.length - 1] : e[a - 1];
    };
    const de = async (e, t, a, s) => {
      await e.setAddonShortcut(B, {
        label: 'Previous viewport',
        defaultShortcut: ['alt', 'shift', 'V'],
        actionName: 'previous',
        action: () => {
          a({ viewport: ke(s, t) });
        },
      }),
        await e.setAddonShortcut(B, {
          label: 'Next viewport',
          defaultShortcut: ['alt', 'V'],
          actionName: 'next',
          action: () => {
            a({ viewport: Re(s, t) });
          },
        }),
        await e.setAddonShortcut(B, {
          label: 'Reset viewport',
          defaultShortcut: ['alt', 'control', 'V'],
          actionName: 'reset',
          action: () => {
            a(Te);
          },
        });
    };
    const Ae = v.div({ display: 'inline-flex', alignItems: 'center' });
    const se = v.div(({ theme: e }) => ({
      display: 'inline-block',
      textDecoration: 'none',
      padding: 10,
      fontWeight: e.typography.weight.bold,
      fontSize: e.typography.size.s2 - 1,
      lineHeight: '1',
      height: 40,
      border: 'none',
      borderTop: '3px solid transparent',
      borderBottom: '3px solid transparent',
      background: 'transparent',
    }));
    const xe = v(L)(() => ({ display: 'inline-flex', alignItems: 'center' }));
    const _e = v.div(({ theme: e }) => ({ fontSize: e.typography.size.s2 - 1, marginLeft: 10 }));
    const Oe = {
      desktop: l.createElement(ne, null),
      mobile: l.createElement(re, null),
      tablet: l.createElement(ae, null),
      other: l.createElement(V, null),
    };
    const Le = ({ api: e }) => {
      const t = F(x);
      const [a, s, c] = G();
      const [b, p] = H(!1);
      const { options: o = Ie, disable: i } = t || {};
      const m = a?.[x] || {};
      const n = m.value;
      const d = m.isRotated;
      const r = o[n] || P;
      const u = b || r !== P;
      const I = x in c;
      const h = Object.keys(o).length;
      if (
        (O(() => {
          de(e, n, s, Object.keys(o));
        }, [o, n, s, e]),
        r.styles === null || !o || h < 1)
      )
        return null;
      if (typeof r.styles === 'function')
        return (
          console.warn(
            'Addon Viewport no longer supports dynamic styles using a function, use css calc() instead',
          ),
          null
        );
      const y = d ? r.styles.height : r.styles.width;
      const k = d ? r.styles.width : r.styles.height;
      return i
        ? null
        : l.createElement(Be, {
            item: r,
            updateGlobals: s,
            viewportMap: o,
            viewportName: n,
            isRotated: d,
            setIsTooltipVisible: p,
            isLocked: I,
            isActive: u,
            width: y,
            height: k,
          });
    };
    const Be = l.memo(e => {
      const {
        item: t,
        viewportMap: a,
        viewportName: s,
        isRotated: c,
        updateGlobals: b,
        setIsTooltipVisible: p,
        isLocked: o,
        isActive: i,
        width: m,
        height: n,
      } = e;
      const d = X(r => b({ [x]: r }), [b]);
      return l.createElement(
        V,
        null,
        l.createElement(
          W,
          {
            placement: 'bottom',
            tooltip: ({ onHide: r }) =>
              l.createElement(q, {
                links: [
                  ...(length > 0 && t !== P
                    ? [
                        {
                          id: 'reset',
                          title: 'Reset viewport',
                          icon: l.createElement(ie, null),
                          onClick: () => {
                            d({ value: void 0, isRotated: !1 }), r();
                          },
                        },
                      ]
                    : []),
                  ...Object.entries(a).map(([u, I]) => ({
                    id: u,
                    title: I.name,
                    icon: Oe[I.type],
                    active: u === s,
                    onClick: () => {
                      d({ value: u, isRotated: !1 }), r();
                    },
                  })),
                ].flat(),
              }),
            closeOnOutsideClick: !0,
            onVisibleChange: p,
          },
          l.createElement(
            xe,
            {
              disabled: o,
              key: 'viewport',
              title: 'Change the size of the preview',
              active: i,
              onDoubleClick: () => {
                d({ value: void 0, isRotated: !1 });
              },
            },
            l.createElement(j, null),
            t !== P ? l.createElement(_e, null, t.name, ' ', c ? '(L)' : '(P)') : null,
          ),
        ),
        l.createElement(Y, {
          styles: { 'iframe[data-is-storybook="true"]': { width: m, height: n } },
        }),
        t !== P
          ? l.createElement(
              Ae,
              null,
              l.createElement(se, { title: 'Viewport width' }, m.replace('px', '')),
              o
                ? '/'
                : l.createElement(
                    L,
                    {
                      key: 'viewport-rotate',
                      title: 'Rotate viewport',
                      onClick: () => {
                        d({ value: s, isRotated: !c });
                      },
                    },
                    l.createElement(K, null),
                  ),
              l.createElement(se, { title: 'Viewport height' }, n.replace('px', '')),
            )
          : null,
      );
    });
    const Pe = (0, $.default)(50)(e => [
      ...Me,
      ...Object.entries(e).map(([t, { name: a, ...s }]) => ({ ...s, id: t, title: a })),
    ]);
    const D = { id: 'reset', title: 'Reset viewport', styles: null, type: 'other' };
    const Me = [D];
    const Ve = (0, $.default)(50)((e, t, a, s) =>
      e
        .filter(c => c.id !== D.id || t.id !== c.id)
        .map(c => ({
          ...c,
          onClick: () => {
            a({ viewport: c.id }), s();
          },
        })),
    );
    const De = ({ width: e, height: t, ...a }) => ({ ...a, height: e, width: t });
    const Ne = v.div({ display: 'inline-flex', alignItems: 'center' });
    const ue = v.div(({ theme: e }) => ({
      display: 'inline-block',
      textDecoration: 'none',
      padding: 10,
      fontWeight: e.typography.weight.bold,
      fontSize: e.typography.size.s2 - 1,
      lineHeight: '1',
      height: 40,
      border: 'none',
      borderTop: '3px solid transparent',
      borderBottom: '3px solid transparent',
      background: 'transparent',
    }));
    const ze = v(L)(() => ({ display: 'inline-flex', alignItems: 'center' }));
    const He = v.div(({ theme: e }) => ({ fontSize: e.typography.size.s2 - 1, marginLeft: 10 }));
    const Ue = (e, t, a) => {
      if (t === null) return;
      const s = typeof t === 'function' ? t(e) : t;
      return a ? De(s) : s;
    };
    const Ge = Q(() => {
      const [e, t] = G();
      const { viewports: a = Ie, defaultOrientation: s, defaultViewport: c, disable: b } = F(x, {});
      const p = Pe(a);
      const o = oe();
      const [i, m] = H(!1);
      c &&
        !p.find(u => u.id === c) &&
        console.warn(
          `Cannot find "defaultViewport" of "${c}" in addon-viewport configs, please check the "viewports" setting in the configuration.`,
        ),
        O(() => {
          de(o, e, t, Object.keys(a));
        }, [a, e, e.viewport, t, o]),
        O(() => {
          const u = s === 'landscape';
          ((c && e.viewport !== c) || (s && e.viewportRotated !== u)) &&
            t({ viewport: c, viewportRotated: u });
        }, [s, c, t]);
      const n =
        p.find(u => u.id === e.viewport) || p.find(u => u.id === c) || p.find(u => u.default) || D;
      const d = ee();
      const r = Ue(d.current, n.styles, e.viewportRotated);
      return (
        O(() => {
          d.current = r;
        }, [n]),
        b || Object.entries(a).length === 0
          ? null
          : l.createElement(
              V,
              null,
              l.createElement(
                W,
                {
                  placement: 'top',
                  tooltip: ({ onHide: u }) => l.createElement(q, { links: Ve(p, n, t, u) }),
                  closeOnOutsideClick: !0,
                  onVisibleChange: m,
                },
                l.createElement(
                  ze,
                  {
                    key: 'viewport',
                    title: 'Change the size of the preview',
                    active: i || !!r,
                    onDoubleClick: () => {
                      t({ viewport: D.id });
                    },
                  },
                  l.createElement(j, null),
                  r
                    ? l.createElement(
                        He,
                        null,
                        e.viewportRotated ? `${n.title} (L)` : `${n.title} (P)`,
                      )
                    : null,
                ),
              ),
              r
                ? l.createElement(
                    Ne,
                    null,
                    l.createElement(Y, {
                      styles: {
                        'iframe[data-is-storybook="true"]': {
                          ...(r || { width: '100%', height: '100%' }),
                        },
                      },
                    }),
                    l.createElement(ue, { title: 'Viewport width' }, r.width.replace('px', '')),
                    l.createElement(
                      L,
                      {
                        key: 'viewport-rotate',
                        title: 'Rotate viewport',
                        onClick: () => {
                          t({ viewportRotated: !e.viewportRotated });
                        },
                      },
                      l.createElement(K, null),
                    ),
                    l.createElement(ue, { title: 'Viewport height' }, r.height.replace('px', '')),
                  )
                : null,
            )
      );
    });
    U.register(B, e => {
      U.add(B, {
        title: 'viewport / media-queries',
        type: te.TOOL,
        match: ({ viewMode: t, tabId: a }) => t === 'story' && !a,
        render: () => (FEATURES?.viewportStoryGlobals ? z(Le, { api: e }) : z(Ge, null)),
      });
    });
  })();
} catch (e) {
  console.error(`[Storybook] One of your manager-entries failed: ${import.meta.url}`, e);
}
