import React, { useState, useMemo, useEffect } from 'react';
import {
  AppView,
  SessionRole,
  ArtworkItem,
  ArtStyle,
  INITIAL_ARTWORKS,
  INITIAL_TRANSACTIONS,
  INITIAL_USERS,
  PlatformUser,
  WalletTransaction,
} from './data/siahSefidData';
import {
  ArtistRegistrationInput,
  CollectorRegistrationInput,
  NewArtworkInput,
  computePlatformMetrics,
  getStyleLabelFa,
  getPathForView,
  resolveViewFromLocation,
} from './utils/siahSefidLogic';
import { NavbarSiahSefid } from './components/NavbarSiahSefid';
import { LandingView } from './components/LandingView';
import { GalleryMarketplaceView } from './components/GalleryMarketplaceView';
import { ArtistStudioView } from './components/ArtistStudioView';
import { CollectorWalletView } from './components/CollectorWalletView';
import { AdminMasterView } from './components/AdminMasterView';
import { RegistrationModals } from './components/RegistrationModals';
import { PreferencesProvider, usePreferences } from './context/PreferencesContext';

function AppShell() {
  const { isRtl, isDark } = usePreferences();
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      return resolveViewFromLocation(window.location.pathname, window.location.search);
    }
    return 'landing';
  });
  const [sessionRole, setSessionRole] = useState<SessionRole>(() => {
    if (typeof window !== 'undefined') {
      const initialView = resolveViewFromLocation(
        window.location.pathname,
        window.location.search
      );
      if (initialView === 'admin-panel') return 'ADMIN';
      if (initialView === 'artist-panel') return 'ARTIST';
      if (initialView === 'collector-panel') return 'COLLECTOR';
    }
    return 'GUEST';
  });

  const [users, setUsers] = useState<PlatformUser[]>(INITIAL_USERS);
  const [artworks, setArtworks] = useState<ArtworkItem[]>(INITIAL_ARTWORKS);
  const [transactions, setTransactions] =
    useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);

  // Active Artist & Collector session pointers
  const [activeArtistId, setActiveArtistId] = useState<string>('artist-1');
  const [activeCollectorId, setActiveCollectorId] = useState<string>('collector-1');

  // Modals state
  const [openRoleModal, setOpenRoleModal] = useState<'ARTIST' | 'COLLECTOR' | null>(
    null
  );
  const [selectedArtworkForLightbox, setSelectedArtworkForLightbox] =
    useState<ArtworkItem | null>(null);

  const artists = useMemo(
    () => users.filter((u) => u.role === 'ARTIST'),
    [users]
  );

  const activeArtist = useMemo(
    () => artists.find((a) => a.id === activeArtistId) || artists[0] || users[0],
    [artists, activeArtistId, users]
  );

  const collectors = useMemo(
    () => users.filter((u) => u.role === 'COLLECTOR'),
    [users]
  );

  const activeCollector = useMemo(
    () =>
      collectors.find((c) => c.id === activeCollectorId) ||
      collectors[0] ||
      users[0],
    [collectors, activeCollectorId, users]
  );

  const metrics = useMemo(
    () => computePlatformMetrics(users, artworks),
    [users, artworks]
  );

  const featuredArtworks = useMemo(() => {
    const feat = artworks.filter((a) => a.featured);
    return feat.length > 0 ? feat : artworks;
  }, [artworks]);

  const acquiredByActiveCollector = useMemo(
    () => artworks.filter((a) => a.sold && a.buyerId === activeCollector.id),
    [artworks, activeCollector.id]
  );

  // Whether the user is inside one of the isolated full-screen dashboards
  const isIsolatedWorkspaceView =
    currentView === 'artist-panel' ||
    currentView === 'collector-panel' ||
    currentView === 'admin-panel';

  // 1. Register new Artist («من هنرمندم»)
  const handleRegisterArtist = (input: ArtistRegistrationInput) => {
    const newId = `artist-${Date.now()}`;
    const newArtist: PlatformUser = {
      id: newId,
      role: 'ARTIST',
      fullName: input.fullName.trim(),
      artisticAlias: input.artisticAlias.trim(),
      artisticName: input.artisticAlias.trim(),
      artisticStyle: input.artisticStyle,
      customStyle:
        input.artisticStyle === 'OTHER' ? input.customStyle?.trim() : undefined,
      phone: input.phone.trim(),
      email: input.email.trim(),
      walletBalance: 0,
      status: 'ACTIVE',
      joinedAt: '1405/08/16',
      totalSalesCount: 0,
      totalSalesRevenue: 0,
    };

    setUsers((prev) => [newArtist, ...prev]);
    setActiveArtistId(newId);
    setSessionRole('ARTIST');
    setOpenRoleModal(null);
    handleNavigateView('artist-panel');
  };

  // 2. Register new Collector («من هنردوستم»)
  const handleRegisterCollector = (input: CollectorRegistrationInput) => {
    const newId = `collector-${Date.now()}`;
    const newCollector: PlatformUser = {
      id: newId,
      role: 'COLLECTOR',
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      walletBalance: Math.max(0, input.initialTopUp),
      status: 'ACTIVE',
      joinedAt: '1405/08/16',
      totalSalesCount: 0,
      totalSalesRevenue: 0,
    };

    setUsers((prev) => [newCollector, ...prev]);
    setActiveCollectorId(newId);
    setSessionRole('COLLECTOR');

    if (input.initialTopUp > 0) {
      const tx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        referenceCode: `TX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: newId,
        userName: newCollector.fullName,
        type: 'TOP_UP',
        amount: input.initialTopUp,
        timestamp: '1405/08/16 — اکنون',
      };
      setTransactions((prev) => [tx, ...prev]);
    }

    setOpenRoleModal(null);
    handleNavigateView('gallery');
  };

  // 3. Purchase Artwork with Wallet Balance
  const handlePurchaseArtwork = (artwork: ArtworkItem) => {
    if (artwork.sold || activeCollector.walletBalance < artwork.price) return;

    const updatedArtwork: ArtworkItem = {
      ...artwork,
      sold: true,
      isSold: true,
      buyerId: activeCollector.id,
      ownerId: activeCollector.id,
    };

    setArtworks((prev) =>
      prev.map((a) => (a.id === artwork.id ? updatedArtwork : a))
    );
    setSelectedArtworkForLightbox(updatedArtwork);

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === activeCollector.id) {
          return { ...u, walletBalance: u.walletBalance - artwork.price };
        }
        if (u.id === artwork.artistId) {
          return {
            ...u,
            walletBalance: u.walletBalance + artwork.price,
            totalSalesCount: u.totalSalesCount + 1,
            totalSalesRevenue: u.totalSalesRevenue + artwork.price,
          };
        }
        return u;
      })
    );

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      referenceCode: `TX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: activeCollector.id,
      userName: activeCollector.fullName,
      type: 'PURCHASE',
      amount: artwork.price,
      artworkId: artwork.id,
      artworkTitle: artwork.title,
      timestamp: '1405/08/16 — اکنون',
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // 4. Wallet Top-Up
  const handleTopUpWallet = (amount: number) => {
    if (amount <= 0) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === activeCollector.id
          ? { ...u, walletBalance: u.walletBalance + amount }
          : u
      )
    );

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      referenceCode: `TX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: activeCollector.id,
      userName: activeCollector.fullName,
      type: 'TOP_UP',
      amount,
      timestamp: '1405/08/16 — اکنون',
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  // 5. Artist Studio: Add / Update / Delete Artwork
  const handleAddArtwork = (input: NewArtworkInput) => {
    const nextNumber = String(artworks.length + 1).padStart(2, '0');
    const resolvedStyleLabel =
      input.style === 'OTHER' && input.customStyle?.trim()
        ? input.customStyle.trim()
        : getStyleLabelFa(input.style);

    const created: ArtworkItem = {
      id: `art-${Date.now()}`,
      accessionCode: `آرشیو ۱۴۰۵-${nextNumber}`,
      title: input.title.trim(),
      titleEn: input.titleEn?.trim() || `Monograph Composition #${nextNumber}`,
      artistId: activeArtist.id,
      artistName: activeArtist.fullName,
      artistAlias: activeArtist.artisticAlias || activeArtist.fullName,
      style: input.style,
      customStyle:
        input.style === 'OTHER' ? input.customStyle?.trim() : undefined,
      styleLabel: resolvedStyleLabel,
      price: input.price,
      dimensions: input.dimensions.trim() || '120 × 150 cm',
      medium: input.medium.trim() || 'تکنیک میکس‌مدیا روی بوم',
      technique: input.medium.trim() || 'تکنیک میکس‌مدیا روی بوم',
      year: '۱۴۰۵',
      story: input.story.trim(),
      image: input.image,
      imageUrl: input.image,
      aspectRatio: '3/4',
      featured: true,
      sold: false,
      isSold: false,
    };

    setArtworks((prev) => [created, ...prev]);
  };

  const handleUpdateArtwork = (
    artworkId: string,
    updates: { title: string; price: number; story: string; style: ArtStyle }
  ) => {
    setArtworks((prev) =>
      prev.map((a) =>
        a.id === artworkId
          ? {
              ...a,
              title: updates.title,
              price: updates.price,
              story: updates.story,
              style: updates.style,
              styleLabel: getStyleLabelFa(updates.style),
            }
          : a
      )
    );
  };

  const handleDeleteArtwork = (artworkId: string) => {
    setArtworks((prev) => prev.filter((a) => a.id !== artworkId));
  };

  // 6. Collector Profile Update
  const handleUpdateCollectorProfile = (updates: {
    fullName: string;
    email: string;
    phone: string;
  }) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === activeCollector.id
          ? {
              ...u,
              fullName: updates.fullName.trim(),
              email: updates.email.trim(),
              phone: updates.phone.trim(),
            }
          : u
      )
    );
  };

  // 7. Admin Actions
  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }
          : u
      )
    );
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleToggleArtworkFeatured = (artworkId: string) => {
    setArtworks((prev) =>
      prev.map((a) => (a.id === artworkId ? { ...a, featured: !a.featured } : a))
    );
  };

  // Guest Join Click handler for the Navbar's 3rd element ("ورود / عضویت" [JOIN ARCHIVE])
  const handleGuestJoinClick = () => {
    if (currentView === 'landing') {
      const roleCtasEl = document.getElementById('landing-role-ctas');
      if (roleCtasEl) {
        roleCtasEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    setOpenRoleModal('ARTIST');
  };

  useEffect(() => {
    const handlePopState = () => {
      const resolved = resolveViewFromLocation(
        window.location.pathname,
        window.location.search
      );
      setCurrentView(resolved);
      if (resolved === 'admin-panel') {
        setSessionRole('ADMIN');
      } else if (resolved === 'artist-panel') {
        setSessionRole('ARTIST');
      } else if (resolved === 'collector-panel') {
        setSessionRole('COLLECTOR');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigateView = (v: AppView) => {
    setCurrentView(v);
    if (typeof window !== 'undefined') {
      const targetPath = getPathForView(v);
      if (window.location.pathname !== targetPath || window.location.search !== '') {
        window.history.pushState({}, '', targetPath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setSessionRole('GUEST');
    handleNavigateView('landing');
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDark
          ? 'bg-[#0a0a0a] text-[#ffffff] selection:bg-[#ffffff] selection:text-[#050505]'
          : 'bg-[#f5f4f0] text-[#000000] selection:bg-[#141314] selection:text-[#fcfcfd]'
      }`}
    >
      {/* Top Header: Whisper-quiet brand mark on Landing; 3-element Navbar on Exhibition Gallery */}
      {!isIsolatedWorkspaceView && (
        <NavbarSiahSefid
          currentView={currentView}
          sessionRole={sessionRole}
          onSelectView={handleNavigateView}
          activeCollector={activeCollector}
          activeArtist={activeArtist}
        />
      )}

      {/* Active View Body */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingView
            metrics={metrics}
            featuredArtworks={featuredArtworks}
            onOpenRoleModal={(role) => setOpenRoleModal(role)}
          />
        )}

        {currentView === 'gallery' && (
          <GalleryMarketplaceView
            artworks={artworks}
            artists={artists}
            activeCollector={activeCollector}
            selectedArtwork={selectedArtworkForLightbox}
            onSelectArtwork={(art) => setSelectedArtworkForLightbox(art)}
            onPurchaseArtwork={handlePurchaseArtwork}
            onQuickTopUp={handleTopUpWallet}
          />
        )}

        {currentView === 'artist-panel' && (
          <ArtistStudioView
            artists={artists}
            activeArtist={activeArtist}
            onSelectArtist={(id) => setActiveArtistId(id)}
            artworks={artworks}
            onAddArtwork={handleAddArtwork}
            onUpdateArtwork={handleUpdateArtwork}
            onDeleteArtwork={handleDeleteArtwork}
            onNavigateView={handleNavigateView}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'collector-panel' && (
          <CollectorWalletView
            activeCollector={activeCollector}
            onUpdateCollectorProfile={handleUpdateCollectorProfile}
            onTopUpWallet={handleTopUpWallet}
            transactions={transactions}
            acquiredArtworks={acquiredByActiveCollector}
            onNavigateView={handleNavigateView}
            onLogout={handleLogout}
          />
        )}

        {currentView === 'admin-panel' && (
          <AdminMasterView
            users={users}
            artworks={artworks}
            transactions={transactions}
            metrics={metrics}
            onToggleUserStatus={handleToggleUserStatus}
            onDeleteUser={handleDeleteUser}
            onToggleArtworkFeatured={handleToggleArtworkFeatured}
            onDeleteArtwork={handleDeleteArtwork}
            onNavigateView={handleNavigateView}
          />
        )}
      </main>

      {/* Role-Based Registration Modal («من هنرمندم» / «من هنردوستم») */}
      <RegistrationModals
        openRole={openRoleModal}
        onClose={() => setOpenRoleModal(null)}
        onRegisterArtist={handleRegisterArtist}
        onRegisterCollector={handleRegisterCollector}
        onSwitchRole={(r) => setOpenRoleModal(r)}
      />
    </div>
  );
}

export function App() {
  return (
    <PreferencesProvider>
      <AppShell />
    </PreferencesProvider>
  );
}

export default App;
