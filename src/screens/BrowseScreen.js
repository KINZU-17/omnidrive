import React, { useState, useMemo } from 'react';
import {
    View, Text, FlatList, TextInput, TouchableOpacity,
    Image, StyleSheet, ScrollView, StatusBar, ActivityIndicator
} from 'react-native';
import { colors, spacing, radius } from '../theme';
import { inventory } from '../data/inventory';

const CATEGORIES = ['All', 'Car', 'Bike', 'Bus'];
const FUELS = ['All', 'Gasoline', 'Diesel', 'Electric', 'Hybrid'];

export default function BrowseScreen({ navigation }) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [fuel, setFuel] = useState('All');
    const [loading, setLoading] = useState(false);

    const filtered = useMemo(() => {
        setLoading(true);
        // Simulate network delay for better UX
        return new Promise(resolve => {
            setTimeout(() => {
                const result = inventory.filter(v => {
                    const matchSearch = `${v.brand} ${v.model}`.toLowerCase().includes(search.toLowerCase());
                    const matchCat = category === 'All' || v.category === category;
                    const matchFuel = fuel === 'All' || v.fuel === fuel;
                    return matchSearch && matchCat && matchFuel;
                });
                resolve(result);
            }, 300);
        });
    }, [search, category, fuel]);

    const renderVehicle = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, styles.cardHover]}
            onPress={() => navigation.navigate('VehicleDetail', { vehicle: item })}
            activeOpacity={0.85}
        >
            <Image
                source={{ uri: item.img }}
                style={styles.cardImage}
                resizeMode="cover"
                defaultSource={{ uri: `https://placehold.co/400x220/161b22/febd69?text=${encodeURIComponent(item.brand)}` }}
            />
            <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.brand} {item.model}</Text>
                <Text style={styles.cardSub}>{item.year} • {item.fuel} • {item.condition}</Text>
                <View style={styles.cardRow}>
                    <Text style={styles.cardPrice}>${item.price.toLocaleString()}</Text>
                    <View style={[styles.badge, item.availability === 'In Stock' ? styles.badgeGreen : styles.badgeOrange]}>
                        <Text style={styles.badgeText}>{item.availability}</Text>
                    </View>
                </View>
                <Text style={styles.cardRating}>⭐ {item.rating} • {item.nation}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

            {/* Search */}
            <View style={styles.searchWrap}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search brands or models..."
                    placeholderTextColor={colors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Category filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: spacing.md }}>
                {CATEGORIES.map(c => (
                    <TouchableOpacity
                        key={c}
                        style={[styles.pill, category === c && styles.pillActive]}
                        onPress={() => setCategory(c)}
                    >
                        <Text style={[styles.pillText, category === c && styles.pillTextActive]}>{c}</Text>
                    </TouchableOpacity>
                ))}
                {FUELS.map(f => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.pill, fuel === f && styles.pillActive]}
                        onPress={() => setFuel(f)}
                    >
                        <Text style={[styles.pillText, fuel === f && styles.pillTextActive]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Loading State */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading vehicles...</Text>
                </View>
            ) : (
                <>
                    <Text style={styles.resultsCount}>{filtered.length || 0} vehicles</Text>

                    <FlatList
                        data={filtered || []}
                        keyExtractor={item => String(item.id)}
                        renderItem={renderVehicle}
                        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        onEndReached={() => {}}
                        onEndReachedThreshold={0.5}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    searchWrap: { padding: spacing.md, paddingBottom: spacing.sm },
    searchInput: {
        backgroundColor: colors.card,
        borderRadius: radius.md,
        padding: spacing.md,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
        fontSize: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    filterRow: { maxHeight: 48, marginBottom: spacing.sm },
    pill: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: radius.full,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
        transition: 'all 0.2s ease',
    },
    pillActive: { 
        backgroundColor: colors.primary, 
        borderColor: colors.primary,
        transform: 'scale(1.05)'
    },
    pillText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
    pillTextActive: { color: colors.bg },
    resultsCount: { color: colors.textMuted, fontSize: 13, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
    card: {
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        marginBottom: spacing.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        elevation: 3,
        transition: 'all 0.3s ease',
    },
    cardHover: {
        transform: 'scale(1.02)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5.84,
        elevation: 5,
        borderColor: colors.primary,
    },
    cardImage: { width: '100%', height: 200 },
    cardBody: { padding: spacing.md },
    cardTitle: { color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: 4 },
    cardSub: { color: colors.textMuted, fontSize: 13, marginBottom: spacing.sm },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    cardPrice: { color: colors.primary, fontSize: 20, fontWeight: '800' },
    badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
    badgeGreen: { backgroundColor: '#1a3a2a' },
    badgeOrange: { backgroundColor: '#3a2a1a' },
    badgeText: { color: colors.success, fontSize: 11, fontWeight: '600' },
    cardRating: { color: colors.textMuted, fontSize: 12 },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bg,
    },
    loadingText: {
        marginTop: 16,
        color: colors.textMuted,
        fontSize: 16,
    },
});
